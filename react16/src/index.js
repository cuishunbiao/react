import React from "../react/index";
const element = <section><h1 title="foo"><span>Hello, world</span></h1></section>;
console.log('element', element);

const container = document.getElementById('root');
React.render(element, container)