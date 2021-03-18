/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */
export default function PaletteProvider(palette, create, elementFactory, globalConnect, bpmnFactory) {
    this.create = create
    this.elementFactory = elementFactory
    this.globalConnect = globalConnect
    this.bpmnFactory = bpmnFactory

    palette.registerProvider(this)
}

PaletteProvider.$inject = [
    'palette',
    'create',
    'elementFactory',
    'globalConnect',
    'bpmnFactory'
]

PaletteProvider.prototype.getPaletteEntries = function () {
    const {
        create,
        elementFactory,
        bpmnFactory,
        globalConnect
    } = this;

    //任务节点
    /*function createTask() {
        return function (event) {
            const businessObject = bpmnFactory.create('bpmn:Task', {custom: 2});
            // businessObject['custom'] = 1 // 这样不行
            const shape = elementFactory.createShape({
                type: 'bpmn:Task',
                businessObject
            });
            const label = elementFactory.createLabel();
            console.log(shape) // 只在拖动或者点击时触发
            console.log(label) // 只在拖动或者点击时触发
            create.start(event, shape);
            // create.start(event, label);
        }
    }*/

    //用户任务节点
    function createUserTask() {
        return function (event) {
            const businessObject = bpmnFactory.create('bpmn:UserTask', {custom: 2});
            // businessObject['custom'] = 1 // 这样不行
            const shape = elementFactory.createShape({
                type: 'bpmn:UserTask',
                businessObject
            });
            const label = elementFactory.createLabel();
            console.log(shape) // 只在拖动或者点击时触发
            console.log(label) // 只在拖动或者点击时触发
            create.start(event, shape);
            // create.start(event, label);
        }
    }

    //开始节点
    function createStratEvent() {
        return function (event) {
            const shape = elementFactory.createShape({
                type: 'bpmn:StartEvent'
            });
            create.start(event, shape);
        }
    }

    //结束节点
    function createEndEvent() {
        return function (event) {
            const shape = elementFactory.createShape({
                type: 'bpmn:EndEvent'
            });
            create.start(event, shape);
        }
    }

    //判断节点
    /* function createGateway() {
         return function (event) {
             const shape = elementFactory.createShape({
                 type: 'bpmn:ExclusiveGateway'
             });
             create.start(event, shape);
         }
     }*/


    return {
        'create.start-event': {
            group: 'event',
            className: 'bpmn-icon-start-event-none icon-custom icon-custom-start',// 自定义节点样式
            /*className: 'bpmn-icon-start-event-none',//默认节点样式*/
            title: '创建开始节点',
            action: {
                dragstart: createStratEvent(),
                click: createStratEvent()
            }
        },
        'create.lindaidai-task': {
            group: 'model',
            className: 'bpmn-icon-task-none icon-custom lindaidai-task', //自定义节点样式
            /*className: 'bpmn-icon-task-none',//默认节点样式*/
            title: '创建一个任务节点',
            action: {
                dragstart: createUserTask(),
                click: createUserTask()
            }
        },
        /*  'create.exclusive-gateway': {
              group: 'gateway',
              className: 'bpmn-icon-gateway-none',
              title: '创建一个判断节点',
              action: {
                  dragstart: createGateway(),
                  click: createGateway()
              }
          },*/
        'create.end-event': {
            group: 'end',
            className: 'bpmn-icon-end-event-none icon-custom icon-custom-end',//自定义节点样式
            /* className: 'bpmn-icon-end-event-none',//默认节点样式*/
            title: '创建结束节点',
            action: {
                dragstart: createEndEvent(),
                click: createEndEvent()
            }
        },
        //箭头节点
        'append.connect-tool': {
            group: 'tools',
            className: 'bpmn-icon-connection-multi icon-custom icon-custom-connection-multi',//自定义节点样式
            title: '创建箭头节点',
            action: {
                click: function (event) {
                    globalConnect.toggle(event)
                }
            }
        },
    }
}
