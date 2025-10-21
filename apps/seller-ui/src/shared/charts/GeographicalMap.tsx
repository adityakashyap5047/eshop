"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const countryData = [
    {name: "India", visitors: 150},
    {name: "United States of America", visitors: 100},
    {name: "United Kingdom", visitors: 80},
    {name: "Canada", visitors: 70},
    {name: "France", visitors: 60},
]

const getColor = (countryName: string) => {
    const country = countryData.find(c => c.name === countryName);

    if (!country) return "#1e293b";
    const total = country.visitors;
    if (total >= 100) return "#065f46"; 
    if (total >= 70) return "#10b981";
    if (total > 20) return "#34d399";
    return "#6ee7b7";
}

const GeographicalMap = () => {
    const [hovered, setHovered] = useState<{
        name: string;
        visitors: number;
    } | null>(null);

    const [tooltipPosition, setTooltipPosition] = useState<{x: number; y: number}>({x: 0, y: 0});

    return (
        <div className="relative w-full px-0 py-5 overflow-visible">
            <ComposableMap
                projection="geoEqualEarth"
                projectionConfig={{scale: 230, center: [0, 10]}}
                width={1400}
                height={600}
                viewBox="0 0 1400 600"
                preserveAspectRatio="xMidMid slice"
                style={{
                    width: "100%",
                    height: "35vh",
                    background: "transparent",
                    margin: 0,
                    padding: 0,
                    display: "block",
                }}
            >
                <Geographies geography={geoUrl}>
                    {({geographies}) =>
                        geographies.map((geo) => {
                            const countryName = geo.properties.name;
                            const match = countryData.find(c => c.name === countryName);
                            const baseColor = getColor(countryName);

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onMouseEnter={(event: any) => {
                                        setTooltipPosition({x: event.pageX, y: event.pageY});
                                        setHovered({
                                            name: countryName,
                                            visitors: match ? match.visitors : 0,
                                        });
                                    }}
                                    onMouseMove = {(event: any) => {
                                        setTooltipPosition({x: event.pageX, y: event.pageY});
                                    }}
                                    onMouseLeave = {() => setHovered(null)}
                                    fill={baseColor}
                                    stroke="#334155"
                                    style={{
                                        default: {
                                            outline: "none",
                                            transition: "fill 0.35 ease-in-out",
                                        },
                                        hover: {
                                            fill: match ? baseColor : "#facc15",
                                            outline: "none",
                                            transition: "fill 0.35 ease-in-out",
                                        },
                                        pressed: { outline: "none", fill: "#ef4444" }
                                    }}
                                />
                                );
                            })
                    }
                </Geographies>
            </ComposableMap>

            <AnimatePresence>
                {hovered && (
                    <motion.div
                        key={hovered.name}
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.95}}
                        transition={{duration: 0.2, ease: "easeOut"}}
                        className="fixed bg-gray-800 text-white text-xs p-2 !rounded shadow-lg"
                        style={{
                            top: tooltipPosition.y,
                            left: tooltipPosition.x,
                        }}
                    >
                        <strong>{hovered.name}</strong>
                        <br />
                        Visitors: <span className="text-green-400">{hovered.visitors}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
};

export default GeographicalMap;