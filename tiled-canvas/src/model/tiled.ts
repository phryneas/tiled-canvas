export interface TypedProperty<Type extends string, ValueType> {
    name: string;
    type: Type;
    value: ValueType;
}

export type Property = TypedProperty<'int', number> | TypedProperty<'string', string>;

export interface BaseLayer {
    height: number;
    id?: number;
    name: string;
    offsetx?: number;
    offsety?: number;
    opacity?: number;
    properties?: Array<Property>;
    visible: boolean;
    width: number;
    x: number;
    y: number;
}

export interface ImageLayer extends BaseLayer {
    type: 'imagelayer';
    image: string;
    transparentcolor?: string;
}

export interface GroupLayer extends BaseLayer {
    type: 'group';
    layers: Array<Layer>;
}

export interface ObjectLayer extends BaseLayer {
    type: 'objectgroup';
    draworder: 'topdown' | 'index';
    object: unknown[];
}

export interface TileLayer extends BaseLayer {
    type: 'tilelayer';
    chunks?: Chunk[];
    data?: number[];
    encoding?: 'csv' | 'base64';
    compression?: 'zlib' | 'gzip';
}

export interface Chunk {
    data: number[];
    height: number;
    width: number;
    x: number;
    y: number;
}

export type Layer = TileLayer | ObjectLayer | GroupLayer | ImageLayer;

export interface Tileset {
    firstgid: number;
    source: string;
}

export interface TmxJson {
    height: number;
    infinite: boolean;
    layers: Layer[];
    nextobjectid: number;
    orientation: string;
    renderorder: string;
    tiledversion: string;
    tileheight: number;
    tilesets: Tileset[];
    tilewidth: number;
    type: string;
    version: number;
    width: number;
}

export interface TsxJson {
    columns: number;
    image: string;
    imageheight: number;
    imagewidth: number;
    margin: number;
    name: string;
    spacing: number;
    tilecount: number;
    tileheight: number;
    tilewidth: number;
    type: string;
    tiles?: TilesObject;
}

interface TilesObject {
    [id: string]: {
        animation: Array<{ duration: number; tileid: number }>;
    };
}
