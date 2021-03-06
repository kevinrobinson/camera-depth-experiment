
// Constants
export const ART_STYLE_COLOR_MAP: {[id: string]: number} = {
  'Baroque': 0xfc4e51,
  'Renaissance': 0x4287f5,
  'Romanticism': 0x1dabe6,
  'Realism': 0x1c366a,
  'Dutch Golden Age': 0xaf060f,
  'Impressionism': 0x003f5c,
  'Post-Impressionism': 0x2f4b7c,
  'Contemporary art': 0xa05195,
  'Neoclassicism': 0xd45087,
  'Italian Renaissance': 0xf95d6a,
  'Academic art': 0xff7c43,
  'Mannerism': 0xffa600,
  'Abstract art': 0xe43034,
  'Ukiyo-e': 0x665191,
  'Other': 0xc3ced0
}

/**
 * Represents a single painting from the GAC dataset.
 */
export interface Painting {
  imageid: string;
  image: string;
  partner_name: string;
  thumbnail: string;
  title: string;
  artist_name: string;
  location: string;
  art_movements: string;
  year: number;
  depth: number;
  style: string;
  range: number;
  std_difference: number;
  range_difference: number;
  asset_link: string;
}

/**
 * Gets the context of an image DOM element.
 * @param image: the Image DOM element.
 */
export function getImageContext(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width * 2;
  canvas.height = image.height * 2;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, image.width * 2, image.height * 2);

  return context;
}

/**
 * Gets the pixel data at a given x and y position of a canvas.
 * @param context the CanvasRenderingContext2D of the image canvas.
 * @param x a number that is the x position of the pixel.
 * @param y a number that is the y position of the pixel.
 * @returns the ImageData object with RGB information for the pixel.
 */
export function getPixelDataFromContext(
    context: CanvasRenderingContext2D, x = 0, y = 0, width = 1, height = 1) {
  return context.getImageData(x, y, width, height).data;
}

/**
 * Gets the color value for a given style.
 * @param style the string with the name of the style.
 */
export function getStyleColor(style: string) {
  return ART_STYLE_COLOR_MAP[style] || ART_STYLE_COLOR_MAP['Other'];
}

/**
 * Delays the execution of a given function by a number of milliseconds.
 * @param delayTime the amount of time to delay by(in millisec.)
 * @param delayedFunction the function to debounce.
 */
export function debounced(delayTime: number, delayedFunction: Function) {
  let timerOutput: number;
  return (...args: object[]) => {
    if (timerOutput) {
      clearTimeout(timerOutput);
    }
    timerOutput = setTimeout(() => {
      delayedFunction(...args);
      timerOutput = null;
    }, delayTime);
  }
}
/**
 * Get the URL id parameter, and ensure that it's a key in the dictionary.
 * @param dict the dictionary validate by.
 * @param defaultVal the default value to return, if the id was not valid.
 */
export function getAndValidateURLID(
    dict: {[id: string]: Painting}, defaultVal: string) {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const id = urlParams.get('id');
  return id in dict ? id : defaultVal;
}

/**
 * Set the URL id parameter.
 * @param id id to set the url param with.
 */
export function setURLID(id: string) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('id', id);
  window.history.replaceState({}, '', `${location.pathname}?#${urlParams}`);
}