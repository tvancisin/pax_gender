import { csvParse, autoType } from 'd3-dsv';
import { feature } from 'topojson-client';
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

export function getMotion() {
  let mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)"); // Check if browser prefers reduced motion
  return !mediaQuery || mediaQuery.matches ? false : true; // return true for motion, false for no motion
}

// DEMO-SPECIFIC FUNCTIONS
export async function getData(url) {
  let response = await fetch(url);
  let string = await response.text();
  let data = await csvParse(string, autoType);
  return data;
}

export async function getTopo(url, layer) {
  let response = await fetch(url);
  let json = await response.json();
  let geojson = await feature(json, layer);
  return geojson;
}

export function getColor(value, breaks, colors) {
  let color;
  let found = false;
  let i = 1;
  while (found == false) {
    if (value <= breaks[i]) {
      color = colors[i - 1];
      found = true;
    } else {
      i++;
    }
  }
  return color ? color : 'lightgrey';
}

export function getBreaks(vals) {
  let len = vals.length;
  let breaks = [
    vals[0],
    vals[Math.floor(len * 0.2)],
    vals[Math.floor(len * 0.4)],
    vals[Math.floor(len * 0.6)],
    vals[Math.floor(len * 0.8)],
    vals[len - 1]
  ];
  return breaks;
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

//create iso array
export function get_current_isos(data) {
  let iso_array = [];
  //construct array of iso's
  data.forEach((d) => {
      iso_array.push(d.Loc1ISO); // Reassign to iso_array
  });
  //remove duplicates
  iso_array = [...new Set(iso_array)];

  return iso_array;
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
