<form
  onSubmit={searchLocation}
  className="location-search"
>
  <input
    type="text"
    placeholder="Search town, estate, street or landmark..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
  />

  <button
    type="submit"
    disabled={searching}
  >
    {searching
      ? "Searching..."
      : "🔍 Search"}
  </button>
</form>
