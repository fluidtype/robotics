"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface FilterValues {
  q: string;
  category: string;
  tag: string;
  sourceId: string;
  from: string;
  to: string;
}

interface NewsFiltersPanelProps {
  initialValues: FilterValues;
  categories: string[];
  tags: string[];
  sources: { id: string; name: string }[];
}

export function NewsFiltersPanel({ initialValues, categories, tags, sources }: NewsFiltersPanelProps) {
  const [values, setValues] = useState<FilterValues>(initialValues);
  const router = useRouter();

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function updateField<Key extends keyof FilterValues>(key: Key, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    router.push(qs ? `/news?${qs}` : "/news");
  }

  function handleReset() {
    setValues({ q: "", category: "", tag: "", sourceId: "", from: "", to: "" });
    router.push("/news");
  }

  return (
    <Card className="space-y-4">
      <CardHeader className="mb-0">
        <CardTitle>Filters</CardTitle>
        <CardDescription>Refine the feed by topic, tag, or time window.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Search</label>
            <Input
              value={values.q}
              onChange={(event) => updateField("q", event.target.value)}
              placeholder="keyword or company"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Category</label>
            <Select value={values.category} onChange={(event) => updateField("category", event.target.value)}>
              <option value="">All</option>
              {categories.map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Tag</label>
            <Select value={values.tag} onChange={(event) => updateField("tag", event.target.value)}>
              <option value="">All tags</option>
              {tags.map((tagOption) => (
                <option key={tagOption} value={tagOption}>
                  {tagOption}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Source</label>
            <Select value={values.sourceId} onChange={(event) => updateField("sourceId", event.target.value)}>
              <option value="">All sources</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">From</label>
              <Input type="date" value={values.from} onChange={(event) => updateField("from", event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">To</label>
              <Input type="date" value={values.to} onChange={(event) => updateField("to", event.target.value)} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Apply
            </Button>
            <Button type="button" variant="ghost" className="flex-1" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
