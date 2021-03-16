import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import {is} from 'bpmn-js/lib/util/ModelUtil';

export default function(group,element){
    if(is(element,'bpmn:start')){
        group.entries.push(entryFactory.selectBox({
            id: 'assignee',
            description: '负责人',
            label: '负责人',
            modelProperty: 'assignee',
            selectOptions: [
                {name:'admin',value:'1'},
                {name:'陈毅',value:'2'},
                {name:'userd',value:'112'}
            ]
        }));
    }
}
