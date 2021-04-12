import styled, { createGlobalStyle, css } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 1rem;
    padding: 0;
    font-family: "Open Sans", Arial, "Helvetica Neue", helvetica, sans-serif;
  }
  * {
    box-sizing: border-box;
  }
`;

export const Container = styled.div``;

const NextIcon = css`
  ::after {
    content: "";
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDMwIDMyIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAxNi4wOTZxMC0uODMyLjU3Ni0xLjM3NnQxLjM3Ni0uNTQ0aDIwLjU0NGwtNy43NDQtNy44MDhxLS42MDgtLjU3Ni0uNjA4LTEuNDA4dC42MDgtMS4zNDRxLjU0NC0uNjA4IDEuMzQ0LS42MDh0MS40MDguNjA4bDEyLjQ4IDEyLjQ4LTEyLjQ4IDEyLjUxMnEtLjY0LjU3Ni0xLjQwOC41NzZ0LTEuMzQ0LS41NzYtLjYwOC0xLjQwOC42MDgtMS4zNzZsNy43NDQtNy43NDRIMS45NTJxLS44IDAtMS4zNzYtLjU3NlQwIDE2LjA5NnoiLz48L3N2Zz4=)
      no-repeat 0.3rem 0;
    background-size: auto;
    background-size: 0.875rem 0.875rem;
    vertical-align: middle;
    width: 1.25rem;
    height: 1.25rem;
    display: inherit;
    position: relative;
    top: 2px;
    left: 4px;
  }
`;

const Button = styled.button`
  display: inline-block;
  cursor: pointer;
  font-weight: 700;
  color: #000;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  ${(props) => props.next && NextIcon}
`;

export const CTAButton = styled(Button)`
  color: #fff;
  background-color: #007fae;
  border-color: #007fae;
  min-height: 2.75rem;
`;
