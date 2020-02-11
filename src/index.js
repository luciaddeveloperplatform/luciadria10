import * as ClusteringTransformer from "@luciad/ria/view/feature/transformation/ClusteringTransformer";
import { Classifier } from "@luciad/ria/view/feature/transformation/Classifier";
import * as FilterFactory from "@luciad/ria/ogc/filter/FilterFactory";
import { LoadEverything } from "@luciad/ria/view/feature/loadingstrategy/LoadEverything";

import { getReference } from "@luciad/ria/reference/ReferenceProvider";
import {RasterDataType} from "@luciad/ria/model/tileset/RasterDataType";
import {RasterSamplingMode} from "@luciad/ria/model/tileset/RasterSamplingMode";
import {createBounds} from "@luciad/ria/shape/ShapeFactory";

import "./index.scss";

import MapFactory from "./factories/MapFactory";
import ModelFactory from "./factories/ModelFactory";
import LayerFactory from "./factories/LayerFactory";
import StatesPainter from "./painters/StatesPainter";
import POIPainter from "./painters/POIPainter";

// The root html Element defined in index.html
const root = document.getElementById("root");

// Create an new html element to hold the map. Assing a class name so we can easy style it with css.
const mapElement = document.createElement("div");
mapElement.classList.add("MyLuciadMap");
root.appendChild(mapElement);

// Create the map and fit to bounds
const map = MapFactory.createMap(mapElement);

// Adding a Grid Layer to the Map, this layer assume default LonLatGrid
const gridLayer = LayerFactory.createGridLayer();

// Creating a WMS model
const wmsModel = ModelFactory.createWMSModel({
    getMapRoot: "https://sampleservices.luciad.com/wms",
    version: "1.3.0",
    reference: getReference("CRS:84"),
    layers: ["4ceea49c-3e7c-4e2d-973d-c608fb2fb07e"],
    transparent: false
});
// Creating a WMS Layer
const wmsLayer = LayerFactory.createRasterLayer(wmsModel, {
    label: "Earth Imagery (WMS)",
    visible: true,
  //  maxScale: 1 / 10000
});

// Creating a LTS Model
const tileSetReference = getReference('EPSG:4326');
const elevationModel = ModelFactory.createLTSModel({
    url: 'https://sampleservices.luciad.com/lts',
    coverageId: 'world_elevation_6714a770-860b-4878-90c9-ab386a4bae0f',
    reference: tileSetReference,
    bounds: createBounds(tileSetReference, [-180, 360, -90, 180]),
    levelCount: 24,
    level0Columns: 4,
    level0Rows: 2,
    tileWidth: 81,
    tileHeight: 81,
    dataType: RasterDataType.ELEVATION,
    samplingMode: RasterSamplingMode.POINT
});

// Creating a LTS Layer (as Raster Layer)
const elevationLayer = LayerFactory.createRasterLayer(elevationModel, {
    label: "Earth elevation (LTS)"
});

// Create TMS Model for elevation
const tmsModel = ModelFactory.createTMSModel({
    baseURL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{-y}.png",
    levelCount: 21,
    subdomains: "a,b,c".split(',')
});

// Create TMS Layer with minScale configured
const tmsLayer = LayerFactory.createRasterLayer(tmsModel, {
    label: "OpenStreetMap",
    visible: true,
    minScale: 1 / 10000
});


// If no codec is provided it will default to GeoJSON
const wfsModel = ModelFactory.createWFSModel({
    serviceURL:	"https://sampleservices.luciad.com/wfs",
    reference: getReference("urn:ogc:def:crs:OGC::CRS84"),
    typeName:	"states",
    versions: ["1.1.0"],
    outputFormat: "application/json",
});

// OGC Filter created with the FilterFacotry
const myFilter = FilterFactory.gt(FilterFactory.property("POP1996"), FilterFactory.literal(10000000));
// Apply filter during the creation of the Layer
const wfsLayer = LayerFactory.createFeatureLayer(wfsModel, {
    label: "States",
    selectable:true,
    loadingStrategy: new LoadEverything({
        query: {filter: myFilter}
    })
});
// Assigning the new painter
wfsLayer.painter = new StatesPainter();

// If no codec is provided it will default to GeoJSON
const poiModel = ModelFactory.createUrlModel({
    target: "./resources/san-francisco_california_osm_point.json",
    reference: getReference("urn:ogc:def:crs:OGC::CRS84")
});

// Create URL Vector Layer, set the minScale value
const poiLayer = LayerFactory.createFeatureLayer(poiModel,
    {label: "Points of interest",
        selectable: true,
        minScale: 1 / 100000
    });

// Our filter function
function offersAccommodation(feature) {
    return feature.properties.tourism === "hotel" ||
        feature.properties.tourism === "hostel" ||
        feature.properties.tourism === "motel" ||
        feature.properties.tourism === "guest_house" ||
        ClusteringTransformer.isCluster(feature);
}
// Applying filter
poiLayer.filter = offersAccommodation;

// Creating a classifier
const poiClassifier = new Classifier();
poiClassifier.getClassification = function (feature) {
    let type = feature.properties.tourism;
    if (offersAccommodation(feature)) {
        if (feature.properties.tourism === "guest_house") {
            return "guesthouse";
        } else {
            return "realhotel";
        }
    }
    return type;
};

// Apply Painter
poiLayer.painter = new POIPainter(poiClassifier);

// Create Clustering transformer
const clusteringTransformer = ClusteringTransformer.create({
    classifier: poiClassifier,
    defaultParameters: {
        clusterSize: 100,
        minimumPoints: 4
    }
});

// Assign clustering transformer to layer
poiLayer.transformer = clusteringTransformer;

// Adding the LTS Layer to the map
map.layerTree.addChild(elevationLayer, "bottom");

// Adding the WMS Layer to the map
map.layerTree.addChild(wmsLayer);

// Adding the TMS Layer to the map
map.layerTree.addChild(tmsLayer);

// Adding WFS Vector Layer
map.layerTree.addChild(wfsLayer);

// Adding URL Vector Layer
map.layerTree.addChild(poiLayer);

// Adding the GRID Layer to the map
map.layerTree.addChild(gridLayer, "top");

const CRS84 = getReference("CRS:84");
const sanFranciscoBounds = createBounds( CRS84, [-122.5,0.15,37.9,-0.10] );
map.mapNavigator.fit({
        bounds: sanFranciscoBounds,
        animate: false
    }
);
