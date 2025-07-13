/**
 * 任务拆分示例：如何把 1-100000 的循环拆分成小任务
 */

// 模拟简单的任务调度器
let tasks = [];
let isPerformingTask = false;
const channel = new MessageChannel();

// 配置参数
const CHUNK_SIZE = 1000; // 每次处理 1000 个数字
const FRAME_TIME = 16;   // 每帧最多 16ms

/**
 * 方法1：按数量拆分（推荐）
 * 把 100000 个数字拆分成 100 个小任务，每个任务处理 1000 个数字
 */
function createTasksByChunk(start, end, chunkSize = CHUNK_SIZE) {
    const tasks = [];

    for (let i = start; i <= end; i += chunkSize) {
        const chunkStart = i;
        const chunkEnd = Math.min(i + chunkSize - 1, end);

        // 创建一个小任务
        tasks.push(() => {
            console.log(`开始处理块: ${chunkStart} - ${chunkEnd}`);

            // 处理这个块内的所有数字
            for (let num = chunkStart; num <= chunkEnd; num++) {
                const result = num * num + Math.sqrt(num);
                // 这里可以是任何耗时操作：DOM 更新、数据处理等
                if (num % 10000 === 0) {
                    console.log(`处理到: ${num}, 结果: ${result}`);
                }
            }

            console.log(`完成块: ${chunkStart} - ${chunkEnd}`);
        });
    }

    return tasks;
}

/**
 * 方法2：按时间拆分（更灵活）
 * 在时间限制内尽可能多地处理数字
 */
function createTasksByTime(start, end) {
    let currentIndex = start;
    const tasks = [];

    while (currentIndex <= end) {
        tasks.push(() => {
            const startTime = performance.now();
            const batchStart = currentIndex;

            // 在时间限制内尽可能多地处理
            while (currentIndex <= end &&
                performance.now() - startTime < 5) { // 每个任务最多 5ms

                const result = currentIndex * currentIndex + Math.sqrt(currentIndex);

                if (currentIndex % 10000 === 0) {
                    console.log(`处理到: ${currentIndex}, 结果: ${result}`);
                }

                currentIndex++;
            }

            console.log(`时间片完成: ${batchStart} - ${currentIndex - 1}, 耗时: ${performance.now() - startTime}ms`);
        });
    }

    return tasks;
}

/**
 * 方法3：动态拆分（最智能）
 * 根据实际执行时间动态调整每次处理的数量
 */
function createAdaptiveTasks(start, end) {
    let currentIndex = start;
    let adaptiveChunkSize = 1000; // 初始块大小
    const tasks = [];

    while (currentIndex <= end) {
        tasks.push(() => {
            const startTime = performance.now();
            const batchStart = currentIndex;
            let processedCount = 0;

            // 处理一个动态大小的块
            while (currentIndex <= end && processedCount < adaptiveChunkSize) {
                const result = currentIndex * currentIndex + Math.sqrt(currentIndex);

                if (currentIndex % 10000 === 0) {
                    console.log(`处理到: ${currentIndex}, 结果: ${result}`);
                }

                currentIndex++;
                processedCount++;
            }

            const executionTime = performance.now() - startTime;

            // 动态调整下次的块大小
            if (executionTime < 3) {
                adaptiveChunkSize = Math.min(adaptiveChunkSize * 1.5, 5000); // 增加块大小
            } else if (executionTime > 8) {
                adaptiveChunkSize = Math.max(adaptiveChunkSize * 0.7, 100);  // 减少块大小
            }

            console.log(`动态块完成: ${batchStart} - ${currentIndex - 1}, ` +
                `耗时: ${executionTime}ms, 下次块大小: ${Math.floor(adaptiveChunkSize)}`);
        });
    }

    return tasks;
}

// 任务执行器
function performTask(currentTime) {
    const frameStartTime = currentTime || performance.now();

    // 在一帧内尽可能多地执行任务
    while (tasks.length > 0 &&
        performance.now() - frameStartTime < FRAME_TIME) {
        const task = tasks.shift();
        task();
    }

    if (tasks.length > 0) {
        // 还有任务，继续下一帧
        console.log(`剩余任务: ${tasks.length}`);
        requestAnimationFrame(performTask);
    } else {
        // 所有任务完成
        console.log('🎉 所有任务完成！');
        isPerformingTask = false;
    }
}

// 启动任务调度
function scheduleWork() {
    if (!isPerformingTask) {
        isPerformingTask = true;
        channel.port2.postMessage(null);
    }
}

// 消息处理
channel.port1.onmessage = () => {
    requestAnimationFrame(performTask);
};

// 使用示例
console.log('=== 方法1：按数量拆分 ===');
tasks = createTasksByChunk(1, 100000, 2000);
console.log(`创建了 ${tasks.length} 个任务`);
// scheduleWork(); // 取消注释来执行

console.log('\n=== 方法2：按时间拆分 ===');
// tasks = createTasksByTime(1, 100000);
// console.log(`创建了 ${tasks.length} 个任务`);
// scheduleWork(); // 取消注释来执行

console.log('\n=== 方法3：动态拆分 ===');
// tasks = createAdaptiveTasks(1, 100000);
// console.log(`创建了 ${tasks.length} 个任务`);
// scheduleWork(); // 取消注释来执行

/**
 * 实际应用场景示例
 */

// 场景1：渲染大列表
function renderLargeList(items) {
    const ITEMS_PER_CHUNK = 50; // 每次渲染 50 个项目

    for (let i = 0; i < items.length; i += ITEMS_PER_CHUNK) {
        tasks.push(() => {
            const chunk = items.slice(i, i + ITEMS_PER_CHUNK);
            chunk.forEach(item => {
                // 创建 DOM 元素
                const element = document.createElement('div');
                element.textContent = item.name;
                document.body.appendChild(element);
            });
        });
    }
}

// 场景2：数据处理
function processLargeDataset(data) {
    const BATCH_SIZE = 1000;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        tasks.push(() => {
            const batch = data.slice(i, i + BATCH_SIZE);
            batch.forEach(item => {
                // 数据转换、验证、计算等
                item.processed = true;
                item.score = calculateScore(item);
            });
        });
    }
}

function calculateScore(item) {
    // 模拟复杂计算
    return Math.random() * 100;
} 