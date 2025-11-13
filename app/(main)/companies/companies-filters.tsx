"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CompanyFilterValues {
  q: string;
  category: string;
  country: string;
}

interface CompaniesFiltersPanelProps {
  initialValues: CompanyFilterValues;
  categories: string[];
  countries: string[];
}

export function CompaniesFiltersPanel({ initialValues, categories, countries }: CompaniesFiltersPanelProps) {
  const [values, setValues] = useState(initialValues);
  const router = useRouter();

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function updateField<Key extends keyof CompanyFilterValues>(key: Key, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    router.push(qs ? `/companies?${qs}` : "/companies");
  }

  function handleReset() {
    setValues({ q: "", category: "", country: "" });
    router.push("/companies");
  }

  return (
    <Card className="space-y-4">
      <CardHeader className="mb-0">
        <CardTitle>Filters</CardTitle>
        <CardDescription>Locate robotics builders by region or focus.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Search</label>
            <Input
              value={values.q}
              onChange={(event) => updateField("q", event.target.value)}
              placeholder="Search companies"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Category</label>
            <Select value={values.category} onChange={(event) => updateField("category", event.target.value)}>
              <option value="">All</option>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Country</label>
            <Select value={values.country} onChange={(event) => updateField("country", event.target.value)}>
              <option value="">All</option>
              {countries.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
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
