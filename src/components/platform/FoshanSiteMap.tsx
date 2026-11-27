"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";

type MapSite = {
  id: string;
  community: string;
  lat: number;
  lng: number;
  status?: "active" | "done";
};

type Props = {
  sites: MapSite[];
  compact: boolean;
  selectedId?: string | null;
  highlightId?: string | null;
  onSelect?: (community: string) => void;
  onFocusStore?: () => void;
};

const STORE = {
  name: "壹品整装 · 佛山店",
  address: "禅城区石湾镇雾岗路华艺装饰材料城北区3座3楼",
  lat: 22.999518,
  lng: 113.09508
};

type Camera = {
  lat: number;
  lng: number;
  zoom: number;
};

const PLACES = [
  { name: "千灯湖", lat: 23.055, lng: 113.142 },
  { name: "桂城", lat: 23.031, lng: 113.14 },
  { name: "大沥", lat: 23.108, lng: 113.118 },
  { name: "禅城", lat: 23.009, lng: 113.122 }
];

const MIN_ZOOM = 9;
const MAX_ZOOM = 17;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function worldPx(lat: number, lng: number, zoom: number) {
  const scale = 256 * 2 ** zoom;
  const x = ((lng + 180) / 360) * scale;
  const sine = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale;
  return { x, y };
}

function worldToLatLng(x: number, y: number, zoom: number) {
  const scale = 256 * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const mercN = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(mercN));
  return { lat, lng };
}

function settle(camera: Camera): Camera {
  let lng = camera.lng;
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return {
    lat: clamp(camera.lat, -80, 80),
    lng,
    zoom: clamp(camera.zoom, MIN_ZOOM, MAX_ZOOM)
  };
}

function chooseZoom(sites: MapSite[], width: number, height: number) {
  const lats = sites.map((site) => site.lat);
  const lngs = sites.map((site) => site.lng);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  for (let zoom = 13; zoom >= MIN_ZOOM; zoom -= 1) {
    const scale = 256 * 2 ** zoom;
    const mid = ((Math.min(...lats) + Math.max(...lats)) / 2) * (Math.PI / 180);
    const pxLng = (lngSpan / 360) * scale;
    const pxLat = (latSpan / 360) * scale * Math.cos(mid);
    if (pxLng < width * 0.46 && pxLat < height * 0.42) return zoom;
  }
  return MIN_ZOOM;
}

function fitCamera(sites: MapSite[], width: number, height: number): Camera {
  const lats = sites.map((site) => site.lat);
  const lngs = sites.map((site) => site.lng);
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    zoom: chooseZoom(sites, width, height)
  };
}

function screenToLatLng(camera: Camera, x: number, y: number, width: number, height: number) {
  const center = worldPx(camera.lat, camera.lng, camera.zoom);
  return worldToLatLng(center.x - width / 2 + x, center.y - height / 2 + y, camera.zoom);
}

function zoomAround(camera: Camera, nextZoom: number, anchorX: number, anchorY: number, width: number, height: number) {
  const zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
  const under = screenToLatLng(camera, anchorX, anchorY, width, height);
  const underPx = worldPx(under.lat, under.lng, zoom);
  const center = worldToLatLng(underPx.x + width / 2 - anchorX, underPx.y + height / 2 - anchorY, zoom);
  return settle({ ...center, zoom });
}

export default function FoshanSiteMap({ sites, compact, selectedId, highlightId, onSelect, onFocusStore }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const animRef = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    mode: "pan" | "pinch";
    cam: Camera;
    x: number;
    y: number;
    dist: number;
    anchorX: number;
    anchorY: number;
  } | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [camera, setCamera] = useState<Camera | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const [pointerCommunity, setPointerCommunity] = useState<string | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);
  const hotId = pointerCommunity || highlightId || null;

  function commit(next: Camera) {
    const settled = settle(next);
    cameraRef.current = settled;
    setCamera(settled);
  }

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const measure = () => {
      const next = { width: node.clientWidth, height: node.clientHeight };
      sizeRef.current = next;
      setSize(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!size.width || !size.height || sites.length === 0 || cameraRef.current) return;
    commit(fitCamera(sites, size.width, size.height));
  }, [size.width, size.height, sites]);

  function fly(target: Camera, ms = 460) {
    const current = cameraRef.current;
    if (!current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      commit(target);
      return;
    }
    const token = ++animRef.current;
    const started = performance.now();
    const tick = (now: number) => {
      if (animRef.current !== token) return;
      const t = Math.min(1, (now - started) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      commit({
        lat: current.lat + (target.lat - current.lat) * eased,
        lng: current.lng + (target.lng - current.lng) * eased,
        zoom: current.zoom + (target.zoom - current.zoom) * eased
      });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  useEffect(() => {
    const site = sites.find((item) => item.community === selectedId);
    const current = cameraRef.current;
    if (!site || !current) return;
    fly({
      lat: site.lat,
      lng: site.lng,
      zoom: Math.max(current.zoom, 15)
    });
  }, [selectedId, sites]);

  function focusStore() {
    setStoreOpen(true);
    onFocusStore?.();
    const current = cameraRef.current;
    fly({
      lat: STORE.lat,
      lng: STORE.lng,
      zoom: Math.max(current?.zoom ?? 15, 15)
    });
  }

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      const current = cameraRef.current;
      if (!current) return;
      event.preventDefault();
      animRef.current += 1;
      const rect = node.getBoundingClientRect();
      const step = clamp(-event.deltaY / 280, -0.85, 0.85);
      commit(
        zoomAround(
          current,
          current.zoom + step,
          event.clientX - rect.left,
          event.clientY - rect.top,
          rect.width,
          rect.height
        )
      );
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  function animateZoom(delta: number, anchor?: { x: number; y: number }) {
    const current = cameraRef.current;
    const node = frameRef.current;
    if (!current || !node) return;
    const rect = node.getBoundingClientRect();
    const point = anchor ?? { x: rect.width / 2, y: rect.height / 2 };
    const target = clamp(current.zoom + delta, MIN_ZOOM, MAX_ZOOM);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || Math.abs(target - current.zoom) < 0.01) {
      commit(zoomAround(current, target, point.x, point.y, rect.width, rect.height));
      return;
    }
    const token = ++animRef.current;
    const from = current;
    const started = performance.now();
    const tick = (now: number) => {
      if (animRef.current !== token) return;
      const t = Math.min(1, (now - started) / 420);
      const eased = 1 - Math.pow(1 - t, 3);
      commit(zoomAround(from, from.zoom + (target - from.zoom) * eased, point.x, point.y, rect.width, rect.height));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function localPoint(event: { clientX: number; clientY: number }) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("[data-map-control], [data-map-pin]")) return;
    const current = cameraRef.current;
    if (!current) return;
    animRef.current += 1;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const point = localPoint(event);
    gesture.current = {
      mode: "pan",
      cam: current,
      x: event.clientX,
      y: event.clientY,
      dist: 0,
      anchorX: point.x,
      anchorY: point.y
    };
    setGrabbing(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pts = Array.from(pointers.current.values());
    const { width, height } = sizeRef.current;
    if (pts.length >= 2) {
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midClient = { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 };
      const mid = localPoint(midClient);
      if (gesture.current.mode !== "pinch" || gesture.current.dist === 0) {
        const current = cameraRef.current;
        if (!current) return;
        gesture.current = {
          mode: "pinch",
          cam: current,
          x: midClient.clientX,
          y: midClient.clientY,
          dist,
          anchorX: mid.x,
          anchorY: mid.y
        };
        return;
      }
      const start = gesture.current;
      const nextZoom = start.cam.zoom + Math.log2(dist / start.dist);
      const under = screenToLatLng(start.cam, start.anchorX, start.anchorY, width, height);
      const underPx = worldPx(under.lat, under.lng, clamp(nextZoom, MIN_ZOOM, MAX_ZOOM));
      const center = worldToLatLng(
        underPx.x - mid.x + width / 2,
        underPx.y - mid.y + height / 2,
        clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
      );
      commit(settle({ ...center, zoom: nextZoom }));
      return;
    }
    const start = gesture.current;
    if (start.mode !== "pan") return;
    const center = worldPx(start.cam.lat, start.cam.lng, start.cam.zoom);
    const next = worldToLatLng(center.x - (event.clientX - start.x), center.y - (event.clientY - start.y), start.cam.zoom);
    commit({ ...start.cam, lat: next.lat, lng: next.lng });
  }

  function endPointer(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) {
      gesture.current = null;
      setGrabbing(false);
      return;
    }
    const current = cameraRef.current;
    const left = Array.from(pointers.current.values())[0];
    if (!current || !left) return;
    const point = localPoint({ clientX: left.x, clientY: left.y });
    gesture.current = {
      mode: "pan",
      cam: current,
      x: left.x,
      y: left.y,
      dist: 0,
      anchorX: point.x,
      anchorY: point.y
    };
  }

  const view = useMemo(() => {
    if (!camera || !size.width || !size.height) return null;
    const zInt = Math.round(camera.zoom);
    const scale = 2 ** (camera.zoom - zInt);
    const centerInt = worldPx(camera.lat, camera.lng, zInt);
    const halfW = size.width / (2 * scale) + 256;
    const halfH = size.height / (2 * scale) + 256;
    const x0 = Math.floor((centerInt.x - halfW) / 256);
    const x1 = Math.floor((centerInt.x + halfW) / 256);
    const y0 = Math.floor((centerInt.y - halfH) / 256);
    const y1 = Math.floor((centerInt.y + halfH) / 256);
    const tiles: { key: string; src: string; left: number; top: number }[] = [];
    const max = 2 ** zInt;
    for (let tx = x0; tx <= x1; tx += 1) {
      for (let ty = y0; ty <= y1; ty += 1) {
        if (ty < 0 || ty >= max) continue;
        const wrapped = ((tx % max) + max) % max;
        tiles.push({
          key: `${zInt}-${tx}-${ty}`,
          src: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${zInt}/${ty}/${wrapped}`,
          left: tx * 256 - centerInt.x + size.width / 2,
          top: ty * 256 - centerInt.y + size.height / 2
        });
      }
    }
    const center = worldPx(camera.lat, camera.lng, camera.zoom);
    const grouped = Array.from(
      sites.reduce((map, site) => {
        const list = map.get(site.community) ?? [];
        list.push(site);
        map.set(site.community, list);
        return map;
      }, new Map<string, MapSite[]>())
    ).map(([, list]) => ({
      community: list[0].community,
      activeCount: list.filter((site) => site.status !== "done").length,
      doneCount: list.filter((site) => site.status === "done").length,
      lat: list[0].lat,
      lng: list[0].lng
    }));
    const projected = grouped.map((group) => {
      const point = worldPx(group.lat, group.lng, camera.zoom);
      return {
        ...group,
        x: point.x - center.x + size.width / 2,
        y: point.y - center.y + size.height / 2
      };
    });
    const gap = camera.zoom >= 15.2 ? 0 : 16;
    const ordered = [...projected].sort(
      (a, b) => Number(b.community === selectedId) - Number(a.community === selectedId)
    );
    const kept = [];
    const cells = new Map<string, { x: number; y: number }[]>();
    for (const pin of ordered) {
      if (pin.x < -40 || pin.x > size.width + 40 || pin.y < -20 || pin.y > size.height + 20) continue;
      if (gap > 0) {
        const cx = Math.floor(pin.x / gap);
        const cy = Math.floor(pin.y / gap);
        let blocked = false;
        if (pin.community !== selectedId && pin.community !== hotId) {
          for (let gx = cx - 1; gx <= cx + 1 && !blocked; gx += 1) {
            for (let gy = cy - 1; gy <= cy + 1 && !blocked; gy += 1) {
              const bucket = cells.get(`${gx}:${gy}`);
              if (!bucket) continue;
              for (const other of bucket) {
                const dx = other.x - pin.x;
                const dy = other.y - pin.y;
                if (dx * dx + dy * dy < gap * gap) {
                  blocked = true;
                  break;
                }
              }
            }
          }
        }
        if (blocked) continue;
        const key = `${cx}:${cy}`;
        const bucket = cells.get(key);
        if (bucket) bucket.push(pin);
        else cells.set(key, [pin]);
      }
      kept.push({
        ...pin,
        labelLeft: pin.x > size.width - 160
      });
    }
    const boxes: { x: number; y: number; w: number; h: number }[] = [];
    const labeled = new Set<string>();
    for (const pin of kept) {
      const selected = pin.community === selectedId;
      if (!selected && pin.community !== hotId && camera.zoom < 13.8) continue;
      const width = Math.min(180, pin.community.length * 13 + 36);
      const height = 26;
      const left = pin.labelLeft ? pin.x - width - 14 : pin.x + 14;
      const top = pin.y - height / 2;
      const blocked = boxes.some(
        (box) => !(left > box.x + box.w + 6 || left + width < box.x - 6 || top > box.y + box.h + 4 || top + height < box.y - 4)
      );
      if (selected || !blocked) {
        labeled.add(pin.community);
        boxes.push({ x: left, y: top, w: width, h: height });
      }
    }
    const pins = kept.map((pin) => ({ ...pin, showLabel: labeled.has(pin.community) }));
    const storePx = worldPx(STORE.lat, STORE.lng, camera.zoom);
    const store = {
      x: storePx.x - center.x + size.width / 2,
      y: storePx.y - center.y + size.height / 2
    };
    const places = PLACES.map((place) => {
      const point = worldPx(place.lat, place.lng, camera.zoom);
      return {
        ...place,
        x: point.x - center.x + size.width / 2,
        y: point.y - center.y + size.height / 2
      };
    }).filter((place) => {
      const inView = place.x > 24 && place.x < size.width - 24 && place.y > 36 && place.y < size.height - 24;
      const hitsStore =
        place.x > store.x - 56 && place.x < store.x + 56 && place.y > store.y - 46 && place.y < store.y + 16;
      return inView && !hitsStore;
    });
    return { tiles, pins, places, scale, store };
  }, [camera, hotId, selectedId, sites, size.height, size.width]);

  const zoom = camera?.zoom ?? MIN_ZOOM;

  return (
    <div
      ref={frameRef}
      data-zoom={camera ? camera.zoom.toFixed(2) : ""}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={(event) => {
        if ((event.target as HTMLElement).closest("[data-map-control], [data-map-pin]")) return;
        const point = localPoint(event);
        animateZoom(1, point);
      }}
      className={`relative w-full touch-none select-none overflow-hidden rounded-[28px] bg-[#f3f4f6] ${
        grabbing ? "cursor-grabbing" : "cursor-grab"
      } ${compact ? "h-[420px]" : "h-[520px]"}`}
      role="application"
      aria-label="佛山工地地图，可拖动缩放。点小区查看施工记录，白标是壹品整装佛山店"
    >
      <div
        className="absolute inset-0"
        style={{ transform: `scale(${view?.scale ?? 1})`, transformOrigin: "center center" }}
      >
        {view?.tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            width={256}
            height={256}
            draggable={false}
            className="absolute max-w-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>
      {view?.places.map((place) => (
        <span
          key={place.name}
          className="pointer-events-none absolute z-[1] -translate-x-1/2 -translate-y-1/2 text-[12px] font-medium tracking-wide text-[#6e6e73]"
          style={{ left: place.x, top: place.y, textShadow: "0 0 6px #fff, 0 0 6px #fff, 0 1px 0 #fff" }}
        >
          {place.name}
        </span>
      ))}
      {view?.pins.map((pin) => {
        const selected = pin.community === selectedId;
        const hot = selected || pin.community === hotId;
        const color =
          pin.doneCount > 0 && pin.activeCount > 0
            ? "#1d1d1f"
            : pin.doneCount > 0
              ? "#34c759"
              : "#ff3b30";
        const above = pin.y > 78;
        return (
          <button
            key={pin.community}
            type="button"
            data-map-pin
            aria-pressed={selected}
            aria-label={`查看${pin.community}`}
            onPointerEnter={() => setPointerCommunity(pin.community)}
            onPointerLeave={() => setPointerCommunity((current) => (current === pin.community ? null : current))}
            onClick={() => {
              setStoreOpen(false);
              onSelect?.(pin.community);
            }}
            className={`absolute ease-out ${hot ? "z-30" : "z-10"}`}
            style={{ left: pin.x, top: pin.y, transform: "translate(-50%, -50%)" }}
          >
            {hot ? (
              <span
                className="map-pin-ring pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 rounded-full border"
                style={{ borderColor: color }}
              />
            ) : null}
            <span
              className={`block rounded-full transition-all duration-200 ${hot ? "h-3.5 w-3.5" : "h-2.5 w-2.5"}`}
              style={{
                background:
                  pin.doneCount > 0 && pin.activeCount > 0
                    ? "linear-gradient(90deg, #ff3b30 50%, #34c759 50%)"
                    : color,
                boxShadow: hot
                  ? "0 0 0 1.5px #fff, 0 4px 10px rgba(0,0,0,0.22)"
                  : "0 0 0 1.5px #fff, 0 1px 2px rgba(0,0,0,0.28)"
              }}
            />
            {hot ? (
              <span
                className={`pointer-events-none absolute left-1/2 z-40 w-max max-w-[220px] -translate-x-1/2 rounded-2xl bg-white/95 px-3 py-2 text-left shadow-[0_10px_28px_rgba(0,0,0,0.16)] ${
                  above ? "bottom-full mb-2" : "top-full mt-2"
                }`}
              >
                <span className="block text-[13px] font-semibold text-[#1d1d1f]">{pin.community}</span>
                <span className="mt-0.5 block text-[11px] text-[#6e6e73]">
                  {pin.activeCount > 0 ? `在施 ${pin.activeCount}` : ""}
                  {pin.activeCount > 0 && pin.doneCount > 0 ? " · " : ""}
                  {pin.doneCount > 0 ? `完工 ${pin.doneCount}` : ""}
                </span>
              </span>
            ) : pin.showLabel ? (
              <span
                className={`absolute top-1/2 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-[12px] font-medium text-[#1d1d1f] shadow-[0_1px_4px_rgba(0,0,0,0.12)] ${
                  pin.labelLeft ? "right-full mr-1.5 -translate-y-1/2" : "left-full ml-1.5 -translate-y-1/2"
                }`}
              >
                {pin.community}
              </span>
            ) : (
              <span className="sr-only">{pin.community}</span>
            )}
          </button>
        );
      })}
      {view ? (
        <button
          type="button"
          data-map-pin
          aria-pressed={storeOpen}
          aria-label={STORE.name}
          onClick={focusStore}
          className="absolute z-40"
          style={{ left: view.store.x, top: view.store.y, transform: "translate(-50%, -100%)" }}
        >
          <span className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.16)] ring-1 ring-black/[0.06]">
            <img src="/brand/yipin-mark.png" alt="" className="h-5 w-5 object-contain" />
            <span className="text-[12px] font-semibold text-[#1d1d1f]">佛山店</span>
          </span>
          <span className="mx-auto mt-0.5 block h-1.5 w-1.5 rounded-full bg-[#e60013] shadow-[0_0_0_1.5px_#fff]" />
        </button>
      ) : null}
      {storeOpen ? (
        <div
          data-map-control
          className="animate-ios-sheet absolute bottom-12 left-4 z-30 w-[248px] rounded-[20px] bg-white/95 p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-semibold text-[#1d1d1f]">{STORE.name}</p>
            <button
              type="button"
              aria-label="关闭佛山店"
              onClick={() => setStoreOpen(false)}
              className="ios-press -mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.05] text-[12px] text-[#6e6e73]"
            >
              ×
            </button>
          </div>
          <p className="mt-1 text-[12px] leading-5 text-[#6e6e73]">{STORE.address}</p>
        </div>
      ) : null}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap items-center gap-x-2 gap-y-1 rounded-full bg-white/95 px-3 py-1 text-[13px] font-medium text-[#1d1d1f] shadow-sm">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ff3b30]" />在施</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#34c759]" />完工</span>
        <span className="inline-flex items-center gap-1"><img src="/brand/yipin-mark.png" alt="" className="h-3.5 w-3.5 object-contain" />佛山店</span>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 z-10 text-[10px] text-[#6e6e73]">地图 © Esri</p>
      <div data-map-control className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
        <div className="liquid-glass flex flex-col overflow-hidden rounded-full">
          <button
            type="button"
            aria-label="放大"
            disabled={zoom >= MAX_ZOOM - 0.01}
            onClick={() => animateZoom(1)}
            className="ios-press flex h-10 w-10 items-center justify-center text-[#1d1d1f] disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="mx-2 h-px bg-black/10" />
          <button
            type="button"
            aria-label="缩小"
            disabled={zoom <= MIN_ZOOM + 0.01}
            onClick={() => animateZoom(-1)}
            className="ios-press flex h-10 w-10 items-center justify-center text-[#1d1d1f] disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          aria-label="定位壹品整装佛山店"
          onClick={focusStore}
          className="ios-press liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-[#1d1d1f]"
        >
          <img src="/brand/yipin-mark.png" alt="" className="h-5 w-5 object-contain" />
        </button>
        <button
          type="button"
          aria-label="显示全部工地"
          onClick={() => {
            const node = frameRef.current;
            if (!node || sites.length === 0) return;
            animRef.current += 1;
            const next = fitCamera(sites, node.clientWidth, node.clientHeight);
            const current = cameraRef.current;
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (!current || reduce) {
              commit(next);
              return;
            }
            const token = ++animRef.current;
            const started = performance.now();
            const tick = (now: number) => {
              if (animRef.current !== token) return;
              const t = Math.min(1, (now - started) / 460);
              const eased = 1 - Math.pow(1 - t, 3);
              commit({
                lat: current.lat + (next.lat - current.lat) * eased,
                lng: current.lng + (next.lng - current.lng) * eased,
                zoom: current.zoom + (next.zoom - current.zoom) * eased
              });
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }}
          className="ios-press liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-[#1d1d1f]"
        >
          <LocateFixed className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
