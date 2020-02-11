import { FeaturePainter } from "@luciad/ria/view/feature/FeaturePainter";
import "./StatesPainter.css";

// Define a style with the desired attributes
const myCustomStyle =  {
    fill: {
        color: "rgba(255,57,74,0.25)",
    },
    stroke: {
        color: "rgb(255,251,82)",
        width: 2
    }
}

const smallColor = "rgba(255,57,74,0.25)";
const mediumColor = "rgba(245,255,110,0.25)";
const largeColor = "rgba(135,247,255,0.25)";

// No much to configure here for this example
const statesLabelStyle = {}

// Define a new Class StatesPainter that inherits from FeaturePainter
class StatesPainter extends FeaturePainter {
    //Overwrite the paintBody methods
    paintBody(geoCanvas, feature, shape, layer, map, paintState) {
        // Set the color accoring to the value of property POP1996
        if ( feature.properties.POP1996 < 1000000) {
            myCustomStyle.fill.color = smallColor;
        }
        if ( 1000000 <= feature.properties.POP1996 && feature.properties.POP1996 < 10000000) {
            myCustomStyle.fill.color = mediumColor;
        }
        if ( 10000000 <= feature.properties.POP1996 ) {
            myCustomStyle.fill.color = largeColor;
        }
        // If features is selected paint border red, if not paint it yellow
        if (paintState.selected) {
            myCustomStyle.stroke.color = "rgb(255,38,93)";
            myCustomStyle.stroke.width = 3;
        } else {
            myCustomStyle.stroke.color = "rgb(255,251,82)";
            myCustomStyle.stroke.width = 2;
        }
        geoCanvas.drawShape(shape, myCustomStyle);
    }

    // Overwrtie paintLabel Method
    paintLabel(labelCanvas, feature, shape, layer, map, paintState) {
        if (feature.properties.STATE_NAME) {
            const label = "<div class=\"usa-state-label\">" + feature.properties.STATE_NAME + "</div>";
            labelCanvas.drawLabelInPath(label, shape, statesLabelStyle);
        }
    }
}

// Don't fotget to expert the class to make it available to other modules
export default StatesPainter;
