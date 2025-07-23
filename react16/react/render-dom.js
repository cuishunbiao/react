// 下一个功能单元
let nextUnitOfWork = null;

export function render(element, container) {
    // 将根节点设置成第一个工作单元
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element]
        }
    }
}


export function createDom(fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)

    // 处理所有属性
    const isProperty = (key) => key !== 'children'
    Object.keys(fiber.props).filter(isProperty).forEach(name => dom[name] = fiber.props[name])

    return dom;
}


/** 
 * 工作循环
 * deadline -> 截止时间
 */
function workLoop(deadline) {
    console.log('deadline', deadline)
    // 停止标识
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        // 执行工作单元
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        // 判断是否需要停止
        shouldYield = deadline.timeRemaining() < 1;
    }
}

// 空闲时执行任务
requestIdleCallback(workLoop);

// 执行单元事件，返回下一个事件「深度优先」
function performUnitOfWork(fiber) {
    console.log('fiber', fiber);

    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }

    const elements = fiber.props.children

    // 索引
    let index = 0;
    // 上一个兄弟节点
    let prevSibling = null;

    while (index < elements.length) {
        const element = elements[index];

        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null
        }

        if (index === 0) {
            fiber.child = newFiber;
        } else if (element) {
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber
        index++
    }

    if (fiber.child) {
        return fiber.child
    }

    let nextFiber = fiber;

    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        console.log('nextFiber: ', nextFiber);
        nextFiber = nextFiber.parent
    }

}
