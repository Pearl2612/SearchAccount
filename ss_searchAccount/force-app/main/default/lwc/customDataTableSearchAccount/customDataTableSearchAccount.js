import LightningDatatable from 'lightning/datatable';
import customImage from './customImage.html';

export default class CustomDataTableSearchAccount extends LightningDatatable {
	static customTypes = {
        customImage: {
            template: customImage,          
        }
    }
    
}