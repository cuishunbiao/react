
问题：
How musch involve life cycle of useEffect in the React?


## 总结
1. 在 React 16 中，因为是递归，一但开始，就无法停止。在 React 18 中增加了 Fiber，可以用来调度任务的优先级。


## JSX

createElement（JSX解析）


JSX -> FiberNode(虚拟 Dom)


对象字面量，定义一个花括号，来创建对象
