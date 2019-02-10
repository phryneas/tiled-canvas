import { TileLayer, Layer, GroupLayer, ImageLayer, ObjectLayer } from './model/tiled';

export const isTileLayer = (layer: Layer): layer is TileLayer => layer.type === 'tilelayer';
export const isGroupLayer = (layer: Layer): layer is GroupLayer => layer.type === 'group';
export const isObjectLayer = (layer: Layer): layer is ObjectLayer => layer.type === 'objectgroup';
export const isImageLayer = (layer: Layer): layer is ImageLayer => layer.type === 'imagelayer';
