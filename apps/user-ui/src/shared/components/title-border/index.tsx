import * as React from "react";

const TitleBorder = (props: any) => (
    <svg
        width={114}
        height={35}
        className="opacity-[.8]"
        viewBox="0 0 114 35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M5 25 Q30 15, 57 20 T109 5"
            stroke="#FE296A"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default TitleBorder;