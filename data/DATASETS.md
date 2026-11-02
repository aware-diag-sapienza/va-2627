# Datasets

| File | Rows |
|---|---|
| [`penguins.csv`](#penguinscsv-palmer-penguins) | 344 |
| [`cars.json`](#carsjson) | 406 |
| [`seattle-weather.csv`](#seattle-weathercsv) | 1461 |
| [`movies.json`](#moviesjson) | 3201 |

## `penguins.csv` (Palmer Penguins)

| Field | Type | Values / unit | Missing |
|---|---|---|---|
| `species` | nominal | Adelie, Chinstrap, Gentoo | 0 |
| `island` | nominal | Biscoe, Dream, Torgersen | 0 |
| `culmen_length_mm` | quantitative | mm | 2 |
| `culmen_depth_mm` | quantitative | mm | 2 |
| `flipper_length_mm` | quantitative | mm | 2 |
| `body_mass_g` | quantitative | grams | 2 |
| `sex` | nominal | male, female | 11 |
| `year` | temporal | `yyyy`| 0 |

Missing values are empty cells. Declare the numeric fields with `format.parse`: without it, an empty cell becomes a stray mark far outside the axes.

```json
"format": {"parse": {"body_mass_g": "number", "flipper_length_mm": "number"}}
```

## cars.json

| Field | Type | Notes | Missing |
|---|---|---|---|
| `Name` | nominal | car model | 0 |
| `Miles_per_Gallon` | quantitative | | 8 |
| `Cylinders` | ordinal | 3, 4, 5, 6, 8 (stored as numbers) | 0 |
| `Displacement` | quantitative | cubic inches | 0 |
| `Horsepower` | quantitative | | 6 |
| `Weight_in_lbs` | quantitative | pounds | 0 |
| `Acceleration` | quantitative | seconds to 60 mph | 0 |
| `Year` | temporal | ISO date string, always January 1st, 1970-1982 | 0 |
| `Origin` | nominal | USA, Europe, Japan | 0 |

## seattle-weather.csv

| Field | Type | Notes |
|---|---|---|
| `date` | temporal | daily, 2012-01-01 to 2015-12-31 |
| `precipitation` | quantitative | mm |
| `temp_max`, `temp_min` | quantitative | Celsius |
| `wind` | quantitative | m/s |
| `weather` | nominal | drizzle (53), fog (101), rain (641), snow (26), sun (640) |

## movies.json

| Field | Type | Notes | Missing |
|---|---|---|---|
| `Title` | nominal | | 1 |
| `US Gross`, `Worldwide Gross` | quantitative | US dollars | 7 |
| `US DVD Sales` | quantitative | US dollars | 2637 |
| `Production Budget` | quantitative | US dollars | 1 |
| `Release Date` | temporal | not a standard format: `Jun 12 1998` | 0 |
| `MPAA Rating` | nominal | | 605 |
| `Running Time min` | quantitative | minutes | 1992 |
| `Distributor` | nominal | | 232 |
| `Source` | nominal | | 365 |
| `Major Genre` | nominal | | 275 |
| `Creative Type` | nominal | | 446 |
| `Director` | nominal | | 1331 |
| `Rotten Tomatoes Rating` | quantitative | 0-100 | 880 |
| `IMDB Rating` | quantitative | 1-10 | 213 |
| `IMDB Votes` | quantitative | | 213 |
