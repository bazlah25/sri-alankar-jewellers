"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProductCatalog } from "@/components/ProductCatalogProvider";

const categories = ["All", "Necklaces", "Earrings", "Rings", "Bracelets", "Bangles", "Chains", "Kadas", "Photo Frames", "Pooja Essentials"];
const priceRanges = [
  { label: "Under ₹1,000", min: "", max: "999" },
  { label: "₹1,000 – ₹2,000", min: "1000", max: "2000" },
  { label: "₹2,000 – ₹3,000", min: "2001", max: "3000" },
  { label: "₹3,000 – ₹5,000", min: "3001", max: "5000" },
  { label: "Above ₹5,000", min: "5001", max: "" },
];

export default function ProductFilters({ initialCategory = "All", initialSort = "Featured", initialSearch = "", initialNewOnly = false, showCategoryPills = true, initialGender = "" }: { initialCategory?: string; initialSort?: string; initialSearch?: string; initialNewOnly?: boolean; showCategoryPills?: boolean; initialGender?: string }) {
  const { products: catalog, loaded } = useProductCatalog();
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : "All");
  const [search, setSearch] = useState(initialSearch.trim());
  const [gender, setGender] = useState(initialGender);
  const sortOptions = ["Featured", "Newest", "Popularity", "Price: Low to High", "Price: High to Low"];
  const [sort, setSort] = useState(sortOptions.includes(initialSort) ? initialSort : "Featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const result = catalog.filter(p =>
      (!initialNewOnly || p.isNew) &&
      (!search || [p.name, p.category, p.material, p.style, ...p.occasions].join(" ").toLocaleLowerCase().includes(search.toLocaleLowerCase())) &&
      (category === "All" || p.category === category) &&
      (!(category === "Rings" || category === "Bracelets" || category === "Chains" || category === "Bangles" || category === "Kadas") || !gender || p.gender === gender || p.gender === "Unisex") &&
      (minPrice === "" || p.price >= Number(minPrice)) &&
      (maxPrice === "" || p.price <= Number(maxPrice))
    );
    return result.sort((a,b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Newest") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      if (sort === "Popularity") return Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller));
      return 0;
    });
  }, [catalog, initialNewOnly, search, category, gender, sort, minPrice, maxPrice]);

  const reset = () => { setCategory("All"); setGender(""); setMinPrice(""); setMaxPrice(""); setSelectedPriceRange(""); setSort("Featured"); };
  const selectPriceRange = (range: typeof priceRanges[number]) => {
    const next = selectedPriceRange === range.label ? null : range;
    setSelectedPriceRange(next?.label || "");
    setMinPrice(next?.min || "");
    setMaxPrice(next?.max || "");
  };
  const controls = (
    <>
      {(category === "Rings" || category === "Bracelets" || category === "Chains" || category === "Bangles" || category === "Kadas") && <details className="sa-filter-accordion" open><summary><span>For</span><ChevronDown aria-hidden="true" size={15}/></summary><fieldset className="sa-filter-choice-group" aria-label="Gender"><label><input type="radio" name="gender" checked={!gender} onChange={() => setGender("")}/><span>All</span></label><label><input type="radio" name="gender" checked={gender === "Male"} onChange={() => setGender("Male")}/><span>Male</span></label><label><input type="radio" name="gender" checked={gender === "Female"} onChange={() => setGender("Female")}/><span>Female</span></label></fieldset></details>}
      <details className="sa-filter-accordion" open><summary><span>Price range</span><ChevronDown aria-hidden="true" size={15}/></summary><fieldset className="sa-filter-choice-group" aria-label="Price range">{priceRanges.map(range => <label key={range.label}><input type="radio" name="priceRange" checked={selectedPriceRange === range.label} onChange={() => selectPriceRange(range)}/><span>{range.label}</span></label>)}</fieldset><div className="sa-price-fields"><span>Custom price (₹)</span><div><input type="number" min="0" placeholder="Minimum" value={minPrice} onChange={e => { setMinPrice(e.target.value); setSelectedPriceRange(""); }}/><input type="number" min="0" placeholder="Maximum" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setSelectedPriceRange(""); }}/></div></div></details>
    </>
  );

  return (
    <div className="sa-catalogue">
      {showCategoryPills && <nav className="sa-category-pills" aria-label="Filter by jewellery category">
        {categories.map(item => <button key={item} type="button" className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === "All" ? "All Jewellery" : item}</button>)}
      </nav>}
      <div className="sa-catalogue-toolbar">
        <button className="sa-filter-toggle" onClick={() => setMobileOpen(true)}><SlidersHorizontal size={16}/> Filters</button>
        <span>{filtered.length} pieces</span>
        <div className="sa-sort"><span>Sort by</span><div className="sa-sort-dropdown" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSortOpen(false); }} onKeyDown={event => { if (event.key === "Escape") setSortOpen(false); }}><button type="button" className="sa-sort-trigger" aria-haspopup="listbox" aria-expanded={sortOpen} onClick={() => setSortOpen(!sortOpen)}>{sort}<ChevronDown aria-hidden="true" size={14}/></button>{sortOpen && <div className="sa-sort-options" role="listbox" aria-label="Sort products">{["Featured", "Newest", "Popularity", "Price: Low to High", "Price: High to Low"].map(option => <button type="button" role="option" aria-selected={sort === option} className={sort === option ? "selected" : ""} key={option} onClick={() => { setSort(option); setSortOpen(false); }}>{option}</button>)}</div>}</div></div>
      </div>
      <div className="sa-catalogue-layout">
        <aside className="sa-filter-sidebar">
          <div className="sa-filter-title"><h2>Filter</h2><button onClick={reset}>Clear all</button></div>
          {controls}
        </aside>
        <div className="sa-results">
          {!loaded ? <div className="sa-empty"><p>Loading products…</p></div> : filtered.length ? <div className="sa-products-grid">{filtered.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <div className="sa-empty"><h2>No pieces found</h2><p>Try adjusting your filters to discover more silver jewellery.</p><button className="sa-button sa-button-dark" onClick={reset}>Clear filters</button></div>}
        </div>
      </div>
      {mobileOpen && <div className="sa-mobile-filter-backdrop" onClick={() => setMobileOpen(false)}><div className="sa-mobile-filter" onClick={e => e.stopPropagation()}><div className="sa-filter-title"><h2>Filter</h2><button aria-label="Close filters" onClick={() => setMobileOpen(false)}><X/></button></div>{controls}<button className="sa-button sa-button-dark" onClick={() => setMobileOpen(false)}>Show {filtered.length} pieces</button><button className="sa-clear-mobile" onClick={reset}>Clear all filters</button></div></div>}
    </div>
  );
}
