/**
 * React Fiber 任务调度器的简化实现
 * 
 * 核心目标：确保在 60fps 的渲染周期内合理分配 CPU 时间
 * 
 * 原理解释：
 * 1. 浏览器每秒渲染 60 次画面，也就是每 16.67ms 渲染一次（1000ms ÷ 60 = 16.67ms）
 * 2. 在每一帧的 16ms 内，浏览器需要完成：渲染、重绘、重排等工作
 * 3. 如果 JavaScript 执行时间太长，就会导致掉帧、卡顿
 * 4. 所以我们需要把大任务拆分成小任务，在每一帧的空闲时间执行
 * 
 * MessageChannel 的作用：
 * - MessageChannel 是浏览器提供的通信 API（2008年左右出现）
 * - 它不创建新线程，而是在当前线程创建一个异步消息通道
 * - 通过 postMessage 发送的消息会进入宏任务队列
 * - 宏任务的执行时机比微任务晚，给浏览器渲染留出时间
 */

// 任务队列：存储所有待执行的任务
let takes = [];

// 任务执行状态标志：防止重复启动任务执行
let isPerformingTash = false;

// 创建消息通道：这是整个调度系统的核心
// MessageChannel 会创建两个端口：port1 和 port2
const channel = new MessageChannel();
const port = channel.port2; // 用于发送消息的端口

// 模拟的业务任务函数
function myTask1() {
    console.log('Preforming task 1');
}

function myTask2() {
    console.log('Preforming task 2');
}

function myTask3() {
    console.log('Preforming task 3');
}

/**
 * 调度任务函数：把任务加入队列并触发执行
 * @param {Function} task - 要执行的任务函数
 * @param {number} timeout - 任务的过期时间（超过这个时间就不执行了）
 */
function scheduleTask(task, timeout) {
    // 把任务和过期时间包装成对象，放入任务队列
    takes.push({
        task,
        timeout,
    });

    console.log('takes', takes);

    // 如果当前没有任务在执行，就启动任务执行流程
    if (!isPerformingTash) {
        isPerformingTash = true; // 标记为正在执行任务

        // 关键步骤：通过 MessageChannel 发送消息
        // 这个消息会进入宏任务队列，不会立即执行
        // 给浏览器一个机会去处理渲染相关的工作
        port.postMessage(null);
    }
}

/**
 * 执行任务函数：在每一帧的时间预算内尽可能多地执行任务
 * @param {number} currentTime - 当前时间戳（由 requestAnimationFrame 提供）
 */
function performTask(currentTime) {
    console.log('currentTime', currentTime);

    // 计算每一帧的时间预算：60fps = 16.67ms 每帧
    const frameTime = 1000 / 60;

    // 时间切片核心逻辑：在当前帧的时间预算内，尽可能多地执行任务
    // 条件1：还有任务待执行
    // 条件2：当前帧还有剩余时间（没超过 16ms）
    while (takes.length > 0 && performance.now() - currentTime < frameTime) {
        // 从队列头部取出一个任务
        const { task, timeout } = takes.shift();

        // 检查任务是否过期
        if (performance.now() >= timeout) {
            // 任务没有过期，执行它
            task();
        } else {
            // 任务过期了，重新放回队列末尾（这里逻辑可能有问题，应该是 <= ）
            takes.push({ task, timeout });
        }
    }

    // 检查是否还有未完成的任务
    if (takes.length > 0) {
        // 还有任务，请求下一帧继续执行
        // requestAnimationFrame 确保在浏览器下次重绘前执行
        requestAnimationFrame(performTask);
    } else {
        // 所有任务执行完毕，重置执行状态
        isPerformingTash = false;
    }
}

/**
 * 消息监听器：当 MessageChannel 收到消息时触发
 * 这是整个调度系统的启动点
 * 
 */
channel.port1.onmessage = () => requestAnimationFrame(performTask);

// 测试代码：添加一些带有不同过期时间的任务
scheduleTask(myTask1, performance.now() + 1000); // 1秒后过期
scheduleTask(myTask2, performance.now()); // 立即过期（应该立即执行）
scheduleTask(myTask3, performance.now() + 3000); // 3秒后过期
