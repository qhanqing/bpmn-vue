// CustomContextPadProvider.js
export default function ContextPadProvider(contextPad, config, injector, translate, bpmnFactory, elementFactory, create, modeling, connect) {
    this.create = create
    this.elementFactory = elementFactory
    this.translate = translate
    this.bpmnFactory = bpmnFactory
    this.modeling = modeling
    this.connect = connect
    /* this.globalConnect = globalConnect //用于箭头节点 要是使用需要从新引入*/
    config = config || {}
    if (config.autoPlace !== false) {
        this.autoPlace = injector.get('autoPlace', false)
    }
    contextPad.registerProvider(this)
}


ContextPadProvider.$inject = [
    'contextPad',
    'config',
    'injector',
    'translate',
    'bpmnFactory',
    'elementFactory',
    'create',
    'modeling',
    'connect',
]
ContextPadProvider.prototype.getContextPadEntries = function (element) {

    const {
        autoPlace,
        create,
        elementFactory,
        translate,
        modeling,
    } = this;

    //创建一个任务节点
    function appendTask(event, element) {
        if (autoPlace) {
            const shape = elementFactory.createShape({type: 'bpmn:UserTask'});
            autoPlace.append(element, shape);
        } else {
            appendTaskStart(event, element);
        }
    }

    //创建一个任务节点
    function appendTaskStart(event) {
        const shape = elementFactory.createShape({type: 'bpmn:UserTask'});
        create.start(event, shape, element);
    }

    //开始节点
    function createStratEvent(event, element) {
        if (autoPlace) {
            const shape = elementFactory.createShape({type: 'bpmn:StartEvent'});
            autoPlace.append(element, shape);
        } else {
            createStratEventStart(event, element);
        }
    }

    //开始节点
    function createStratEventStart(event) {
        const shape = elementFactory.createShape({type: 'bpmn:StartEvent'});
        create.start(event, shape);
    }

    //结束节点
    function createEndEvent(event, element) {
        if (autoPlace) {
            const shape = elementFactory.createShape({type: 'bpmn:EndEvent'});
            autoPlace.append(element, shape);
        } else {
            createEndEventStart(event, element);
        }
    }

    //结束节点
    function createEndEventStart(event) {
        const shape = elementFactory.createShape({type: 'bpmn:EndEvent'});
        create.start(event, shape);
    }

    // 删除功能
    function removeElement() {
        modeling.removeElements([element])
    }

    return {
        //任务节点
        'append.lindaidai-task': {
            group: 'model',
            className: 'bpmn-icon-task-none',
            title: translate('创建一个任务节点'),
            action: {
                click: appendTask,
                dragstart: appendTaskStart
            }
        },
        //开始节点
        'append.start-event': {
            group: 'event',
            /* className: 'icon-custom icon-custom-start',自定义节点样式*/
            className: 'bpmn-icon-start-event-none',
            title: '创建开始节点',
            action: {
                click: createStratEvent,
                dragstart: createStratEventStart,
            }
        },
        //结束节点
        'append.end-event': {
            group: 'end',
            /* className:  'icon-custom icon-custom-start',自定义节点样式*/
            className: 'bpmn-icon-end-event-none',
            title: '创建结束节点',
            action: {
                click: createEndEvent,
                dragstart: createEndEventStart,

            }
        },
        /* //箭头节点
         'append.connect-tool': {
             group: 'tools',
             className: 'bpmn-icon-connection-multi',//自定义节点样式
             title: '创建箭头节点',
             action: {
                 click: function (event) {
                     globalConnect.toggle(event)
                 }
             }
         },*/
        //删除按钮
        'create.delete': {
            group: 'delete',
            className: 'icon-custom icon-custom-remove',//自定义节点样式
            title: '删除',
            action: {
                click: removeElement
            }
        },
    };
}
