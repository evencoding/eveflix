import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

const GlobalStyles = createGlobalStyle`
    ${reset}
    *{
        box-sizing:border-box;
    }
    body{
        color: ${(props) => props.theme.white.darker};
        background-color:rgba(18,18,18,1);
        font-family: 'Source Sans Pro', sans-serif;
        -ms-overflow-style:none;
    }
    body::-webkit-scrollbar { display:none; }
    a{
        text-decoration:none;
        color:inherit;
    }
`;

export default GlobalStyles;
