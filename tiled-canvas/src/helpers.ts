import { TileLayer, Layer, GroupLayer, ImageLayer, ObjectLayer } from './model/tiled';
import {
    BaseObject,
    TilemapObject,
    Point,
    Polygon,
    Polyline,
    Rectangle,
    Text,
    Ellipse
} from './model/tiled-geometry-objects';

export const isTileLayer = (layer: Layer): layer is TileLayer => layer.type === 'tilelayer';
export const isGroupLayer = (layer: Layer): layer is GroupLayer => layer.type === 'group';
export const isObjectLayer = (layer: Layer): layer is ObjectLayer => layer.type === 'objectgroup';
export const isImageLayer = (layer: Layer): layer is ImageLayer => layer.type === 'imagelayer';

export const isTilemapObject = (obj: BaseObject): obj is TilemapObject => !!(obj as TilemapObject).gid;
export const isEllipse = (obj: BaseObject): obj is Ellipse => !!(obj as Ellipse).ellipse;
export const isPoint = (obj: BaseObject): obj is Point => !!(obj as Point).point;
export const isPolygon = (obj: BaseObject): obj is Polygon => !!(obj as Polygon).polygon;
export const isPolyline = (obj: BaseObject): obj is Polyline => !!(obj as Polyline).polyline;
export const isText = (obj: BaseObject): obj is Text => !!(obj as Text).text;
export const isRectangle = (obj: BaseObject): obj is Rectangle =>
    !isTilemapObject(obj) && !isEllipse(obj) && !isPoint(obj) && !isPolygon(obj) && !isPolyline(obj) && !isText(obj);
