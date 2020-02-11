import * as ClusteringTransformer from "@luciad/ria/view/feature/transformation/ClusteringTransformer";
import { FeaturePainter } from "@luciad/ria/view/feature/FeaturePainter";
import { PointLabelPosition } from "@luciad/ria/view/style/PointLabelPosition";

import "./POIPainter.css";

// A Mapping to the files names, nomal icons end as png, selected icons end as Selected.png
//  ie, camping.png and campingSelected.png
const iconMapping = {
    camp_site: "camping",
    picnic_site: "camping",
    viewpoint: "viewPoint",
    hotel: "hotel",
    attraction: "attraction",
    museum: "museum",
    gallery: "attraction",
    hostel: "hotel",
    information: "information",
    motel: "hotel",
    caravan_site: "camping",
    artwork: "museum",
    guest_house: "guest_house",
    Tour: "attraction",
    ruins: "attraction",
    theme_park: "attraction",
    memorial: "attraction",
    picnic_table: "camping",
    art_gallery: "museum",
    view_scope: "viewPoint"
}

const pointStyle = {
    width: "32px",
    height: "32px",
    draped: false
};

const clusterStyle = {
    width: "42px",
    height: "42px",
    draped: false,
    url: "./resources/icons/hotelCluster.png"
};

const guestHouseClusterStyle = {
    width: "42px",
    height: "42px",
    draped: false,
    url: "./resources/icons/guest_houseCluster.png"
}

const labelStyle = {positions: PointLabelPosition.NORTH, offset: 15};

class POIPainter extends FeaturePainter{
    constructor(clasifier) {
        super();
        this.clasifier = clasifier;
    }

    paintBody(geoCanvas, feature, shape, layer, map, paintState) {
        if (ClusteringTransformer.isCluster(feature)) {
            const firstfeatureInCluster = ClusteringTransformer.clusteredFeatures(feature)[0];
            const classification = this.clasifier.getClassification(firstfeatureInCluster);
            if (classification === "realhotel") {
                geoCanvas.drawIcon(shape, clusterStyle);
            } else {
                geoCanvas.drawIcon(shape, guestHouseClusterStyle);
            }
        } else
        if (paintState.selected) {
            //  Pass the url to the desired icon
            pointStyle.url = "./resources/icons/" + iconMapping[feature.properties.tourism] + "Selected.png";
            geoCanvas.drawIcon(shape, pointStyle);
        } else {
            //  Pass the url to the desired icon
            pointStyle.url = "./resources/icons/" + iconMapping[feature.properties.tourism] + ".png";
            geoCanvas.drawIcon(shape, pointStyle);
        }
    }

    // Overwrtie paintLabel Method
    paintLabel(labelCanvas, feature, shape, layer, map, paintState) {
        if (ClusteringTransformer.isCluster(feature)) {
            const firstfeatureInCluster = ClusteringTransformer.clusteredFeatures(feature)[0];
            const classification = this.clasifier.getClassification(firstfeatureInCluster);
            let labelStyle = "";
            if (classification === "realhotel") {
                labelStyle = "color:#0000ff;font-weight: bold;text-align: center;";
            } else {
                labelStyle = "color:#6CB35C;font-weight: bold;text-align: center;";
            }
            const label = "<div style='" + labelStyle + "'>" +
                ClusteringTransformer.clusteredFeatures(feature).length
                + "</div>";
            labelCanvas.drawLabel(label, shape, {positions: PointLabelPosition.CENTER});
        } else
        if (paintState.selected) {
            if (feature && feature.properties) {
                const name = feature.properties.name ? feature.properties.name : "Noname";
                const tourism = feature.properties.tourism ? feature.properties.tourism : "Unknown";
                const label =
                    "<div class=\"labelwrapper\">" +
                    "<div class=\"blueColorLabel\">" +
                    "<div class=\"theader\">" +
                    "<div class=\"leftTick blueColorTick\"></div>" +
                    "<div class=\"rightTick blueColorTick\"></div>" +
                    "<div class=\"name\">" + name + "</div>" +
                    "</div>" +
                    "<div class=\"type\">Type : " + tourism + "</div>" +
                    "</div>" +
                    "</div>";
                labelCanvas.drawLabel(label, shape, labelStyle);
            }
        }
    }

}

export default POIPainter;
