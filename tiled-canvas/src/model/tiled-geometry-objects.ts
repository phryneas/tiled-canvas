import { Property } from './tiled';

export interface BaseObject {
    id: number;
    name: string;
    properties?: Array<Property>;
    rotation?: 0;
    type: string;
    visible: boolean;
    template?: unknown; // maybe we support this in the late future...
    x: number;
    y: number;
}

export interface TilemapObject extends BaseObject {
    gid: string;
}

export interface Ellipse extends BaseObject {
    ellipse: true;
    height: number;
    width: number;
}

export interface Rectangle extends BaseObject {
    height: number;
    width: number;
}

export interface Point extends BaseObject {
    point: true;
}

export interface Polygon extends BaseObject {
    polygon: Array<{ x: number; y: number }>;
}

export interface Polyline extends BaseObject {
    polyline: Array<{ x: number; y: number }>;
}

export interface Text extends BaseObject {
    height: number;
    width: number;
    text: { [key: string]: string };
}

export type GeometryObject = TilemapObject | Ellipse | Rectangle | Point | Polygon | Polyline | Text;
