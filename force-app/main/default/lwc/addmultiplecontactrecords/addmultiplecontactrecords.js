import { LightningElement,wire,track } from 'lwc';
import CONTACT_OBJECT from "@salesforce/schema/Contact";
import GENDER_IDENITY_FIELD from "@salesforce/schema/contact.GenderIdentity";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
export default class Addmultiplecontactrecords extends LightningElement {
    @track contacts = [];

    targetObjects = [
        {
            label: 'Account',
            value: 'Account'
        }
    ];

    displayInfos = {
        Account: {
            additionalFields: ['Type']
        }
    };

    matchingInfos = {
        Account: {
            additionalFields: [{ fieldPath: 'Type' }]
        }
    };
    get displayInfo() {
        return this.displayInfos[this.selectedTarget];
    }

    get matchingInfo() {
        return this.matchingInfos[this.selectedTarget];
    }

    get showTargetSelector() {
        return this.currentSelectedRecordId === null;
    }

    handleTargetSelection(event) {
        this.selectedTarget = event.target.value;
        this.refs.recordPicker.clearSelection();
    }

    handleRecordSelect(event) {
        this.currentSelectedRecordId = event.detail.recordId;
    }

    selectedTarget = 'Account';
    currentSelectedRecordId = null;

    @wire(getObjectInfo,{
        objectApiName : CONTACT_OBJECT
    }) contactobjectinfo;
    @wire(getPicklistValues,{
        recordTypeId : '$contactobjectinfo.data.defaultRecordTypeId',
        fieldApiName:GENDER_IDENITY_FIELD})
         genderpicklistvalues;
    get getGenderpicklistvalues(){
        return this.genderpicklistvalues?.data?.values;
    }
    connectedCallback(){
        this.addNewClickHandler();
    }
    addNewClickHandler(event){
        this.contacts.push({
            tempId: Date.now()
        })
    }
    deleteClickHandler(event){
        if(this.contacts.length == 1){
            this.showToast('You Cannot Delete Last Contact Record');
            return;
        }
        let tempId = event.target?.dataset.tempId;
        this.contacts = this.contacts.filter(a=>a.tempId != tempId);
    }
    elementChangeHandler(event){
        
        let contactRow = this.contacts.find(a=>a.tempId==event.target.dataset.tempId);
        if(contactRow){
            contactRow[event.target.name] = event.target?.value; 
        }
    }
    submitClickHandler(event){
        const allvalied = this.checkControlsValidity();
        if(allvalied){

        } else
        {
            this.showToast('Please Correct Below Errors to Procced Further');
        }

    }
    checkControlsValidity(){
        let isValid = true,
        controls = this.template.querySelectorAll('lightning-input,lightning-combobox,lightning-record-picker');
        controls.forEach(field =>{
            if(!field.checkValidity()){
                field.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
    showToast(message,title='Error',variant='error') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
            
        });
        this.dispatchEvent(event);
    }
}