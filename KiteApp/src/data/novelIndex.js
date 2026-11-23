/**
 * src/data/novelIndex.js
 * Central index for all visual novels with stable lowercase string IDs.
 */

export const NOVEL_INDEX = [
  {
    id: "einstieg",
    numericId: 13,
    backgroundId: "einstieg",
    showInSelection: false,
    defaultVisibleCharacterIds: [2],
    characterPosition: "center",
    defaultCharacterAppearances: {},
  },
  {
    id: "eltern",
    numericId: 2,
    backgroundId: "eltern",
    showInSelection: true,
    defaultVisibleCharacterIds: [7, 8],
    characterPosition: "center",
    defaultCharacterAppearances: {
      7: 1,
      8: 1,
    },
  },
  {
    id: "honorar",
    numericId: 11,
    backgroundId: "honorar",
    showInSelection: true,
    defaultVisibleCharacterIds: [12],
    characterPosition: "left",
    defaultCharacterAppearances: {
      12: 1,
    },
  },
  {
    id: "investor",
    numericId: 9,
    backgroundId: "investor",
    showInSelection: true,
    defaultVisibleCharacterIds: [9],
    characterPosition: "left",
    defaultCharacterAppearances: {
      9: 1,
    },
  },
  {
    id: "bank",
    numericId: 10,
    backgroundId: "bank",
    showInSelection: true,
    defaultVisibleCharacterIds: [11],
    characterPosition: "left",
    defaultCharacterAppearances: {
      11: 1,
    },
  },
  {
    id: "notarin",
    numericId: 4,
    backgroundId: "notarin",
    showInSelection: true,
    defaultVisibleCharacterIds: [10],
    characterPosition: "left",
    defaultCharacterAppearances: {
      10: 1,
    },
  },
  {
    // Stable id for the raw novel titled "Interview abklaeren".
    id: "presse",
    numericId: 3,
    backgroundId: "presse",
    showInSelection: true,
    defaultVisibleCharacterIds: [5],
    characterPosition: "center",
    defaultCharacterAppearances: {
      5: 1,
    },
  },
  {
    id: "vermieter",
    numericId: 6,
    backgroundId: "vermieter",
    showInSelection: true,
    defaultVisibleCharacterIds: [6],
    characterPosition: "right",
    defaultCharacterAppearances: {
      6: 2,
    },
  },
];

/**
 * Helper to get settings by numeric ID from the index.
 */
export function getNovelSettingsByNumericId(numericId) {
  return NOVEL_INDEX.find((n) => n.numericId === Number(numericId)) || null;
}
