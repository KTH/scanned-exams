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

const Alert = styled.div`
  width: 100%;
  margin: 0 0 50px;
  font-size: 1rem;
  border: none;
  padding: 30px 30px 30px 70px;
  min-height: 0;
  color: #000;
  overflow: auto;
  margin: 1rem 0;
`;

export const DangerAlert = styled(Alert)`
  &::before {
    font-size: 1.8rem;
    position: absolute;
    width: 1em;
    top: 25px;
    left: 30px;
    border-radius: 0.15rem;
    content: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODYgODYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNNDMgODZjMjMuNzQ4IDAgNDMtMTkuMjUyIDQzLTQzUzY2Ljc0OCAwIDQzIDAgMCAxOS4yNTIgMCA0M3MxOS4yNTIgNDMgNDMgNDN6IiBmaWxsPSIjRTAxRjI4Ii8+PHBhdGggZD0iTTQxLjUxIDUyLjI1NGwtMS41My0yMS42Mzh2LTkuMDVoNi4yMXY5LjA1bC0xLjQ1IDIxLjYzOGgtMy4yM3pNNDAuMjAxIDYyLjM5di01LjcwOGg1Ljc2NXY1LjcwOEg0MC4yeiIgc3Ryb2tlPSIjRkZGIiBmaWxsPSIjRkZGIi8+PC9nPjwvc3ZnPg==);
  }
  position: relative;
  background-color: #f5e6e6;
`;
