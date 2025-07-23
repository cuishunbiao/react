export function render(element, container) {
    const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type)

    // 处理所有属性
    const isProperty = (key) => key !== 'children'
    Object.keys(element.props).filter(isProperty).forEach(name => dom[name] = element.props[name])

    // 遍历执行 children，递归，不可以被中断
    element.props.children.forEach(child => render(child, dom));

    // 最终添加 Dom
    container.appendChild(dom)
}

// 利用浏览器的时间切片来调试 DOM 渲染。

// FiberNode
while (如果有下一个工作单元) {
    // 执行下一个工作单元
}
