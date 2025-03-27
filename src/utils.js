import * as d3 from "d3";
import { centralPointsStore } from './store';

let central_points;

// Subscribe to the store
centralPointsStore.subscribe((value) => {
  central_points = value;
});

// CORE FUNCTIONS
export function setColors(themes, theme) {
  for (let color in themes[theme]) {
    document.documentElement.style.setProperty('--' + color, themes[theme][color]);
  }
}
export async function getIndividualCSV(path) {
  let loadedData = await d3.csv(path);
  return loadedData;
}

export async function getCSV(paths) {
  const promises = paths.map(path => getIndividualCSV(path));
  const results = await Promise.all(promises);
  return results;
}

export async function getGEO(url) {
  const response = d3.json(url)
  return response;
}

// Create a line generator using d3.line with curveMonotoneX to maintain left-to-right flow
export const lineGenerator = d3
  .line()
  .x((d) => d[0]) // X coordinate from the generated points
  .y((d) => d[1]) // Y coordinate from the generated points
  .curve(d3.curveMonotoneX); // Ensures the line progresses monotonically in the X direction

// Generate a more controlled line that mimics handwriting with 5 peaks and dips
export function generateHandwrittenLine(x, y, length) {
  let variation = 0.3
  // if (gender == "1") {
  //   variation = 1
  // }
  // else {
  //   variation = 0.1
  // }
  const points = [];
  const segments = 5; // Number of segments (5 peaks/dips)
  const segmentLength = length / segments;

  let currentX = x;
  let currentY = y;

  for (let i = 0; i <= segments; i++) {
    const randomOffsetX = Math.random() * segmentLength * 0.5; // Small X variation for natural look
    const peakDipOffsetY = (i % 2 === 0)
      ? Math.random() * 2 + variation // Peaks (up)
      : Math.random() * -2 - variation; // Dips (down)

    currentX += segmentLength; // Move right progressively
    currentY += peakDipOffsetY; // Create alternating peaks and dips

    points.push([currentX + randomOffsetX, currentY]);
  }
  return points;
}

export let years = [
  "1990",
  "1991",
  "1992",
  "1993",
  "1994",
  "1995",
  "1996",
  "1997",
  "1998",
  "1999",
  "2000",
  "2001",
  "2002",
  "2003",
  "2004",
  "2005",
  "2006",
  "2007",
  "2008",
  "2009",
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
];

export let most_women = [
  "2015",
  "2016",
  "2008",
  "2014",
  "2013",
  "2003",
  "2006",
  "2011",
  "2004",
  "2018",
  "1996",
  "2002",
  "2012",
  "2019",
  "1994",
  "1995",
  "1999",
  "1993",
  "2005",
  "2007",
  "2021",
  "2001",
  "2020",
  "2023",
  "1991",
  "1998",
  "2009",
  "2000",
  "2010",
  "2017",
  "2022",
  "1992",
  "1997",
  "1990",
];

// //create iso array
// export function get_current_isos(data) {
//   let iso_array = [];
//   //construct array of iso's
//   data.forEach((d) => {
//     iso_array.push(d.Loc1ISO); // Reassign to iso_array
//   });
//   //remove duplicates
//   console.log(iso_array);

//   // iso_array = [...new Set(iso_array)];

//   return iso_array;
// }

// Create ISO array with counters
export function get_current_isos(data) {
  const iso_counter = {};

  // Construct an object to count occurrences of Loc1ISO
  data.forEach((d) => {
    if (iso_counter[d.Loc1ISO]) {
      iso_counter[d.Loc1ISO]++;
    } else {
      iso_counter[d.Loc1ISO] = 1;
    }
  });

  // Convert the object into an array of objects with ISO and count
  const iso_array = Object.entries(iso_counter).map(([iso, count]) => ({
    iso,
    count,
  }));

  let filtered_iso = iso_array.filter((d) => d.iso != "")

  return filtered_iso;
}

//central points for map
export function get_current_central_points(pax) {
  let current_isos = pax
    .map((d) => {
      if (d.GeWom == "1") {
        return d.Loc1ISO;
      }
    })
    .filter((iso) => iso !== undefined && iso !== null);

  // Create the new array of objects
  let points = current_isos
    .map((code) => {
      // Find the matching country object
      const country = central_points.find((c) => c.iso_code === code);

      if (country) {
        return {
          name: country.name,
          code: code,
          longitude: +country.central_longitude,
          latitude: +country.central_latitude,
        };
      } else {
        // Return null or any fallback in case no match is found
        return null;
      }
    })
    .filter((item) => item !== null); // Remove null entries

  return points;
}


//GRID
let gap = 3;
//initial grid construction
export function full_grid(pax, innerHeight, innerWidth, initialPaxCount) {
  // Dynamically calculate the number of columns based on the width and the initial pax count
  let numCols = Math.ceil(
    Math.sqrt(initialPaxCount * (innerWidth / innerHeight)),
  );
  let numRows = Math.ceil(initialPaxCount / numCols);

  // Calculate available space after accounting for gaps
  let totalGapX = (numCols - 1) * gap;
  let totalGapY = (numRows - 1) * gap;

  // Compute the width and height of each rectangle, accounting for gaps
  let rectWidth = (innerWidth - totalGapX) / numCols;
  let rectHeight = (innerHeight - totalGapY) / numRows;

  let rendered_data = pax.map((d, i) => {


    return {
      x: (i % numCols) * (rectWidth + gap) + Math.random() * 2 - 1,
      y:
        innerHeight -
        (Math.floor(i / numCols) + 1) * (rectHeight + gap) + Math.random() * 2 - 1,
      width: rectWidth,
      height: rectHeight,
      id: d.AgtId,
      info: d.Agt
    };
  });
  return rendered_data;
}

//full grid but with filter
export function full_grid_filter(pax, innerHeight, innerWidth, initialPaxCount) {
  // Dynamically calculate the number of columns based on the width and the initial pax count
  let numCols = Math.ceil(
    Math.sqrt(initialPaxCount * (innerWidth / innerHeight)),
  );
  let numRows = Math.ceil(initialPaxCount / numCols);

  // Calculate available space after accounting for gaps
  let totalGapX = (numCols - 1) * gap;
  let totalGapY = (numRows - 1) * gap;

  // Compute the width and height of each rectangle, accounting for gaps
  let rectWidth = (innerWidth - totalGapX) / numCols;
  let rectHeight = (innerHeight - totalGapY) / numRows;

  let index = 0; // Only increment for GeWom === "1" entries

  let rendered_data = pax.map((d) => {
    if (d.GeWom === "0") {
      // For entries with GeWom === "0", set them off-screen
      return {
        x: (index % numCols) * (rectWidth + gap),
        y: innerHeight + 100,
        width: rectWidth,
        height: rectHeight,
        info: d.Agt
      };
    }

    // Calculate x and y based on current index
    const x = (index % numCols) * (rectWidth + gap) + Math.random() * 2 - 1;
    const y =
      innerHeight - (Math.floor(index / numCols) + 1) * (rectHeight + gap) + Math.random() * 2 - 1;

    index++; // Increment only for GeWom === "1"

    return {
      x: x,
      y: y,
      width: rectWidth,
      height: rectHeight,
      info: d.Agt
    };
  });

  return rendered_data;
}

export function pax_stages_grid(pax_stages, innerHeight, innerWidth) {
  // Define stage names in the order they should appear as columns
  // Define the external column gap and internal cell gap
  let columns = pax_stages;
  let columnGap = 10; // Gap between each stage column
  let cellGap = 2; // Internal gap between rectangles within each column
  let numColumns = 7; // Total columns for each stage
  let cellsPerRow = 10; // 10 cells horizontally per column

  // Calculate the width of each stage column, accounting for column gaps
  let rectWidth =
    (innerWidth - (numColumns - 1) * columnGap) / numColumns;

  // Calculate the width of each cell within a column, accounting for internal gaps
  let cellWidth = (rectWidth - (cellsPerRow - 1) * cellGap) / cellsPerRow;

  // Calculate the number of rows needed based on the largest stage dataset
  let maxEntries = Math.max(
    ...columns.map(([stage, entries]) => entries.length),
  );
  let numRows = Math.ceil(maxEntries / cellsPerRow);

  // Calculate the height of each cell within a column to fit `innerHeight`, including gaps
  let cellHeight = (innerHeight - (numRows - 1) * cellGap) / numRows;

  // Render data for each stage column
  let rendered_data = columns.flatMap(([stage, entries], colIndex) => {
    return entries.map((d, i) => {
      // Calculate x based on column index and gap
      let x = colIndex * (rectWidth + columnGap);

      // Calculate row and column indices for each cell
      let row = Math.floor(i / cellsPerRow); // New row every 10 entries
      let col = i % cellsPerRow; // Position within the 10-column grid

      // Calculate y position from bottom to top
      let y = innerHeight - (row + 1) * (cellHeight + cellGap);

      return {
        x: x + col * (cellWidth + cellGap) + Math.random() * 2 - 1, // Horizontal position within column's grid
        y: y + Math.random() * 2 - 1, // Vertical position from bottom to top
        width: cellWidth, // Adjusted width to fit screen
        height: cellHeight, // Adjusted height to fit screen
        info: d.Agt,
        id: d.AgtId,
      };
    });
  });
  return rendered_data;
}

//stages gid with filter
export function pax_stages_filter_grid(
  pax_stages,
  innerHeight,
  innerWidth,
  filter,
) {
  // Define stage names in the order they should appear as columns
  let columns = pax_stages;
  // Define the external column gap and internal cell gap
  let columnGap = 10; // Gap between each stage column
  let cellGap = 2; // Internal gap between rectangles within each column
  let numColumns = 7; // Total columns for each stage
  let cellsPerRow = 10; // 10 cells horizontally per column

  // Calculate the width of each stage column, accounting for column gaps
  let rectWidth =
    (innerWidth - (numColumns - 1) * columnGap) / numColumns;

  // Calculate the width of each cell within a column, accounting for internal gaps
  let cellWidth = (rectWidth - (cellsPerRow - 1) * cellGap) / cellsPerRow;

  // Calculate the number of rows needed based on the largest stage dataset
  let maxEntries = Math.max(
    ...columns.map(([stage, entries]) => entries.length),
  );
  let numRows = Math.ceil(maxEntries / cellsPerRow);

  // Calculate the height of each cell within a column to fit `innerHeight`, including gaps
  let cellHeight = (innerHeight - (numRows - 1) * cellGap) / numRows;

  // Render data for each stage column
  let rendered_data = columns.flatMap(([stage, entries], colIndex) => {
    let currentRow = 0; // Track the current row for "GeWom" entries equal to "1"
    let currentCol = 0; // Track the current column within each row for "GeWom" entries equal to "1"

    return entries.map((d) => {
      // For entries with GeWom == "0", place them off-screen
      if (d[filter] === "0") {
        return {
          x: colIndex * (rectWidth + columnGap) +
            currentCol * (cellWidth + cellGap), // Off-screen x position
          y: innerHeight + 100, // Off-screen y position
          width: cellWidth,
          height: 0,
          info: d.Agt,
          id: d.AgtId,
        };
      }

      // Calculate x based on current column and column index
      let x =
        colIndex * (rectWidth + columnGap) +
        currentCol * (cellWidth + cellGap);

      // Calculate y position from bottom to top for GeWom == "1"
      let y = innerHeight - (currentRow + 1) * (cellHeight + cellGap);

      // Update column and row positions
      currentCol++;
      if (currentCol >= cellsPerRow) {
        currentCol = 0; // Reset column position
        currentRow++; // Move to the next row
      }

      return {
        x: x + Math.random() * 2 - 1, // Horizontal position within column's grid
        y: y + Math.random() * 2 - 1, // Vertical position based on row
        width: cellWidth, // Adjusted width to fit screen
        height: cellHeight, // Adjusted height to fit screen
        info: d.Agt
      };
    });
  });
  return rendered_data;
}


// //full grid but with filter
// export function full_grid_hide_non_gender(pax, innerHeight, innerWidth, initialPaxCount, gap) {
//   // Dynamically calculate the number of columns based on the width and the initial pax count
//   let numCols = Math.ceil(
//     Math.sqrt(initialPaxCount * (innerWidth / innerHeight)),
//   );
//   let numRows = Math.ceil(initialPaxCount / numCols);

//   // Calculate available space after accounting for gaps
//   let totalGapX = (numCols - 1) * gap;
//   let totalGapY = (numRows - 1) * gap;

//   // Compute the width and height of each rectangle, accounting for gaps
//   let rectWidth = (innerWidth - totalGapX) / numCols;
//   let rectHeight = (innerHeight - totalGapY) / numRows;

//   let index = 0; // Only increment for GeWom === "1" entries

//   let rendered_data = pax.map((d) => {
//     // Calculate x and y based on current index
//     const x = (index % numCols) * (rectWidth + gap);
//     const y =
//       innerHeight - (Math.floor(index / numCols) + 1) * (rectHeight + gap);

//     index++; // Increment only for GeWom === "1"

//     if (d.GeWom === "0") {
//       // For entries with GeWom === "0", set them off-screen
//       return {
//         x: x,
//         y: y,
//         width: rectWidth,
//         height: 0,
//       };
//     }


//     return {
//       x: x,
//       y: y,
//       width: rectWidth,
//       height: rectHeight,
//     };
//   });

//   return rendered_data;
// }
