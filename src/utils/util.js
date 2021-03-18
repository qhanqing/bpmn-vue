const customElements = ['bpmn:StartEvent'] // 自定义元素的类型
const customConfig = { // 自定义元素的配置
    /*'bpmn:UserTask': {
        'url': 'https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/start.png',
        'attr': { x: 0, y: 0, width: 48, height: 48 }
    },*/
    'bpmn:StartEvent': {
        'url': 'https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/start.png',
        'attr': {x: 0, y: 0, width: 40, height: 40}
    }
}
const hasLabelElements = ['bpmn:StartEvent', 'bpmn:UserTask', 'bpmn:EndEvent'] // 一开始就有label标签的元素类型

export {customElements, customConfig, hasLabelElements}
