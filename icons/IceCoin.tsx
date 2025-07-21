import { IconProps } from "../utils/types";

const UsdtTrc20: React.FC<IconProps> = ({ size = 24, className = "" }) => {
    const svgSize = `${size}px`;

    // Color variables following IceCoin pattern
    const s0 = '#26A17B';  // Primary USDT color (replacing yellow)
    const s1 = '#53C4A3';  // Lighter USDT
    const s2 = '#1A6E52';  // Darker USDT
    const s3 = '#0488cf';  // Ice accent blue
    const s4 = '#ffffff';  // Pure white
    const s5 = '#abddf8';  // Light blue
    const s6 = '#fffeff';  // Off-white
    const s7 = '#e1f3fd';  // Very light blue
    const s8 = '#9cd7f9';  // Medium light blue
    const s9 = '#fdfeff';  // Nearly white

    return (
        <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 660" className={className} height={svgSize} width={svgSize}>
            {/* Base coin structure */}
            <g id="Object">
                <g id="coin-base">
                    <g id="layers">
                        <g id="outer-circle">
                            <path id="base" fill={s0} d="m12.5 330c0-175.4 142.1-317.5 317.5-317.5 175.4 0 317.5 142.1 317.5 317.5 0 175.4-142.1 317.5-317.5 317.5-175.4 0-317.5-142.1-317.5-317.5z" />
                        </g>
                        <g id="inner-circle">
                            <path id="inner" fill={s1} d="m60.5 330c0-148.8 120.7-269.5 269.5-269.5 148.8 0 269.5 120.7 269.5 269.5 0 148.8-120.7 269.5-269.5 269.5-148.8 0-269.5-120.7-269.5-269.5z" />
                        </g>
                        <g id="highlight">
                            <path id="shine" fill={s2} d="m107.7 354.7c0-131.4 106.5-237.9 237.9-237.9 76.8 0 145.1 36.4 188.6 92.9-41.1-71.3-118.1-119.4-206.3-119.4-131.4 0-237.9 106.5-237.9 237.9 0 54.6 18.4 104.9 49.4 145-20.2-34.9-31.7-75.4-31.7-118.5z" />
                        </g>
                    </g>
                </g>
            </g>

            {/* Ice effect filters */}
            <filter id="f0">
                <feFlood flood-color={s2} flood-opacity="0.3" />
                <feBlend mode="hard-light" in2="SourceGraphic" />
                <feComposite in2="SourceAlpha" operator="in" />
            </filter>

            {/* USDT T symbol with ice effect */}
            <g id="usdt-symbol" filter="url(#f0)">
                <path 
                    d="M330 240 L330 420 M230 240 L430 240" 
                    stroke={s4} 
                    strokeWidth="40" 
                    strokeLinecap="round"
                    fill="none"
                />
                
                {/* Ice reflections */}
                <path id="reflection1" fill={s7} d="m324.7 210.6c-5-2.3-12-3.1-20.4-1.4-17.9 3.5-35.8 19.6-49.7 30.9-19.5 15.8-22.8 22.9-4.1 39.3 13 11.6 27.7 20 43.6 27.1 15.6 7.1 31.4 13.2 48.1 6.6 16-6.3 34.5-9.6 49.1-18.7 4.7-3 27.6-18.6 12.9-24.5-5.1-2-16.8 1.9-21.6 4.1-21.7 9.8-55.7 41.7-80.2 20.8-21.3-18.2 10.7-35.9 21-47 14.8-15.9 13.5-31.4 1.3-37.2z" opacity="0.3"/>
                
                {/* Additional ice highlights */}
                <path id="highlight1" fill={s8} d="m322.8 493.6c1.3-1.3 2.1-3.9 2.1-7.2l-0.4-122c0-6.8-3.1-14.7-7.8-20.9q-2.6 0.9-4.9 2.2l-106.3 61.4c-6.4 3.7-9 8.7-8.1 13.5 3 4.7 6.8 8.7 10.9 11l105.4 61.3q0.1 0 0.3 0.1q2.4 1 5.1 1.8c0.2 0 0.4 0 0.6 0q1.9 0 3.1-1.2z" opacity="0.2"/>
            </g>
        </svg>
    );
};

export default UsdtTrc20;