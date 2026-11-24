"use client";

import React, { useCallback, useEffect, useState } from "react";
import EmployeePlatform from "@/components/platform/EmployeePlatform";
import { demoStore } from "@/lib/mock-data";
import { Community, Lead, Material } from "@/lib/types";

export default function HomePage() {
  const [communities, setCommunities] = useState<Community[]>(demoStore.communities);
  const [materials, setMaterials] = useState<Material[]>(demoStore.materials);
  const [leads, setLeads] = useState<Lead[]>(demoStore.leads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [cRes, mRes, lRes] = await Promise.all([
        fetch("/api/communities?scope=internal").then((response) =>
          response.ok ? response.json() : null
        ),
        fetch("/api/materials?scope=internal").then((response) =>
          response.ok ? response.json() : null
        ),
        fetch("/api/leads").then((response) => (response.ok ? response.json() : null))
      ]);
      if (cRes?.data) setCommunities(cRes.data);
      if (mRes?.data) setMaterials(mRes.data);
      if (lRes?.data) setLeads(lRes.data);
    } catch {
      // Fallback gracefully to bundled demoStore when running statically
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <EmployeePlatform
      communities={communities}
      materials={materials}
      leads={leads}
      loading={loading}
      error={error}
      onRefresh={loadAll}
    />
  );
}
