import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_continentsLow from "@amcharts/amcharts5-geodata/continentsLow";
import { PeerDetail } from "../interfaces/peer";

interface Props {
    id: string;
}

let pointSeries: any;
export const registerNetworkMap = ({ id }: Props) => {
    const root = am5.Root.new(id);
    root.setThemes([
        am5themes_Animated.new(root)
    ]);

    const map = root.container.children.push(
        am5map.MapChart.new(root, {
            panX: "none",
            panY: "none",
            wheelY: "none",
            wheelX: "none",
            projection: am5map.geoNaturalEarth1()
        })
    );

    map.series.push(
        am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_continentsLow,
            exclude: ["antarctica"],
            fill: am5.color('#e8ba58')
        })
    );

    pointSeries = map.series.push(
        am5map.MapPointSeries.new(root, {})
    );

    let colorSet = am5.ColorSet.new(root, { step: 2 });

    pointSeries.bullets.push((root: any, series: any, dataItem: any) => {
        const value = dataItem.dataContext.value;
        const container = am5.Container.new(root, {});
        const color = colorSet.next();
        const radius = 30;

        container.children.push(am5.Circle.new(root, {
            radius: radius,
            fill: color,
            dy: -radius * 2
        }))

        container.children.push(am5.Line.new(root, {
            stroke: color,
            height: -40,
            strokeGradient: am5.LinearGradient.new(root, {
                stops: [
                    { opacity: 1 },
                    { opacity: 1 },
                    { opacity: 0 }
                ]
            })
        }));

        container.children.push(am5.Label.new(root, {
            text: value + ' MB',
            fontSize: '10px',
            fill: am5.color(0xffffff),
            fontWeight: "600",
            centerX: am5.p50,
            centerY: am5.p50,
            dy: -radius * 2
        }))

        return am5.Bullet.new(root, {
            sprite: container
        });
    });
}

export const onPeerConnect = (peer: PeerDetail, size: number): Promise<void> => {
    if (!peer) {
        return Promise.resolve();
    }

    console.log(peer)

    return new Promise(() => {
        pointSeries.data.push({
            geometry: { type: "Point", coordinates: [peer.lng, peer.lat] },
            value: Math.round((size / 1024 / 1024) * 100) / 100,
        });
    });
}