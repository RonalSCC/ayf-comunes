
import React from 'react';
import 'combobox.css';
import $, { data } from "jquery";
// import 'jquery-ui-bundle';
import { useEffect, useState } from 'react';

type ParamsComboType = {
    ID:string,
    Text:string,
    ShowID?:boolean |null,
    onSelectEvent: Function,
    onClearEvent?: Function |null,
    SelectDefault?: any |null
}
const Combobox = (
    {
        ID = "0", 
        Data,
        Name,
        params
    }: 
    {
        ID: string, 
        Data:Array<any>, 
        Name?:string, 
        params:ParamsComboType
    }
) =>{

    const [dataCombo, setDataCombo] = useState<Array<any>>([]);

    const IDCombo = `${ID}`;
    
    useEffect(() => {
        if (Data.length > 0) {
            const newData = [...Data];
            setDataCombo(newData);
            if (params.SelectDefault) {
                let objDefault = Data.filter((d) => d[params.ID] == params.SelectDefault);
                if (objDefault && objDefault.length > 0) {
                    SelectOption(objDefault[0])
                }
            }
        }
    }, [Data]);

    window.addEventListener('click', function(e: Event){ 
        if (e != null) {
            var elementCombo = document.getElementById(IDCombo);  
            if (elementCombo) {
                if (!elementCombo.contains(e.target as Node)){
                    if ($(`[combo-target=${IDCombo}]`).hasClass('ShowData')) {
                        $(`[combo-target=${IDCombo}]`).removeClass('ShowData');
                    }
                }
            }
        }
        
        
    });

    const ShowHideData = (ID:string)=>{
        var ElementsShow = $('.CDataCombo').not(`[combo-target=${ID}]`).removeClass('ShowData');
        var ComboSelected = $(`[combo-target=${ID}]`);
        if (ComboSelected) {
            if (ComboSelected.css('display') == "none") {
                ComboSelected.addClass('ShowData');
            }else{
                ComboSelected.removeClass('ShowData');
            }
            $('#input-'+ID).trigger('focus');
        } 
    }
    
    const SearchCombo = (ID:string, e:React.KeyboardEvent)=>{
        // ------------------------------------------------------------
        // Se valida si se está viendo la información, sino se muestra.
        // ------------------------------------------------------------

        if ($(`[combo-target=${ID}]`).css('display') == "none") {
            ShowHideData(ID);
        }

        // ------------------------------------------------------------
        // KeyCode Event: Eventos para cuando se oprime:
        // Flecha Abajo: KeyCode = 40
        // Flecha Arriba: KeyCode = 38
        // ------------------------------------------------------------
        if (e.keyCode == 40 || e.keyCode == 38) {
            let dataFocus = dataCombo.filter(f=> f.focus == true);
            let IDFocus = null;
            if (dataFocus.length > 0) {
                for (let i = 0; i < dataCombo.length; i++) {
                    if(dataCombo[i].focus == true){
                        dataCombo[i].focus = false;
                        if (e.keyCode == 40) {
                            if (dataCombo[i + 1]) {
                                dataCombo[0].focus = false;
                                dataCombo[i + 1].focus =true;
                                IDFocus = dataCombo[i + 1][params.ID];
                                break;
                            }
                        }else if(e.keyCode == 38){
                            if (dataCombo[i - 1]) {
                                dataCombo[0].focus = false;
                                dataCombo[i - 1].focus =true;
                                IDFocus = dataCombo[i - 1][params.ID];
                                break;
                            }else{
                                let last = dataCombo.length - 1;
                                dataCombo[last].focus = true;
                                IDFocus = dataCombo[last][params.ID];
                                break;
                            }
                        }
                    }else{
                        dataCombo[0].focus = true;
                        IDFocus = dataCombo[0][params.ID];
                    }
                }
            }else
            {
                if(e.keyCode == 40){
                    dataCombo[0].focus = true;
                    IDFocus = dataCombo[0][params.ID];
                }else{
                    let last = dataCombo.length - 1;
                    dataCombo[last].focus = true;
                    IDFocus = dataCombo[last][params.ID];
                }
            }

            setDataCombo([...dataCombo]);
            if (IDFocus) {
                var elementSelection = document.getElementById('id-combo-'+IDFocus) as HTMLElement;
                let querySelectorComboTarget = document.querySelector('[combo-target="'+IDCombo+'"]') as HTMLElement;
                let comboTargetHeight = querySelectorComboTarget.offsetHeight;
                let offSetSelection = elementSelection.offsetTop + elementSelection.offsetHeight;
                if (comboTargetHeight < offSetSelection) {
                    querySelectorComboTarget.scrollTo(0, offSetSelection - comboTargetHeight)
                }else{
                    if (e.keyCode == 38) {
                        querySelectorComboTarget.scrollTo(0, offSetSelection - (comboTargetHeight ) - (comboTargetHeight - elementSelection.offsetHeight))
                    }else{
                        querySelectorComboTarget.scrollTo(0, offSetSelection - comboTargetHeight)
                    }
                }
            }
        }
        // ------------------------------------------------------------
        // Enter : KeyCode = 13
        // Tab: KeyCode = 9
        // ------------------------------------------------------------
        else if(e.keyCode == 13 || e.keyCode == 9){
            SelectOption();
        }
        // ------------------------------------------------------------
        // FILTRAR
        // Cuando se escribe en la caja de texto para filtrar
        // ------------------------------------------------------------
        else{
            setTimeout(function(){  
                var value = (e.target as HTMLInputElement).value;
                if (value == null) {
                    value = "";
                }
                let dataFilter = [...Data.filter((d) =>{
                    if (typeof d[params.Text] === 'string' && (params.ShowID == true && typeof d[params.ID] === 'string')) {

                        return d[params.Text].toLowerCase().includes(value.toLowerCase()) || 
                               d[params.ID].toLowerCase().includes(value.toLowerCase());

                    }else if(typeof d[params.Text] !== 'string' && (params.ShowID == true && typeof d[params.ID] !== 'string')){

                        return value ? (d[params.Text] == value || d[params.ID] == value) : d

                    }else if(typeof d[params.Text] === 'string'){

                        return d[params.Text].toLowerCase().includes(value.toLowerCase());

                    }else if(typeof d[params.Text] !== 'string'){

                        return value ? (d[params.Text] == value) : d

                    }
                })];
                dataFilter.map((f) => f.focus=false);
                if (value) {
                    if (dataFilter[0]) {
                        dataFilter[0].focus = true;
                    }
                }
                setDataCombo(dataFilter);

                if(!value){
                    if (params.onClearEvent) {
                        params.onClearEvent();
                    }
                }
            }, 100);
        }
    }

    const SelectOption = (selected?:any)=>{
        if (!selected) {
            let dataFocus = dataCombo.filter(f=> f.focus == true);
            if (dataFocus && dataFocus.length > 0) {
                $(`#input-`+IDCombo).val(params.ShowID ? dataFocus[0][params.ID] + " - " + dataFocus[0][params.Text] : dataFocus[0][params.Text]);
                ShowHideData(IDCombo);
                if (params.onSelectEvent) {
                    params.onSelectEvent(dataFocus[0]);
                }
            }
        }else{
            $(`#input-`+IDCombo).val(params.ShowID ? selected[params.ID] + " - " + selected[params.Text] : selected[params.Text]);
                ShowHideData(IDCombo);
                if (params.onSelectEvent) {
                    params.onSelectEvent(selected);
                }
        }
    }
    
    return (
        <>
            <div id={IDCombo} className="col-sm-12 position-relative">
                {
                    Name && <div className='col-sm-12'>
                                <label className='LabelCombobox' htmlFor="">{Name}</label>
                            </div>
                }
                
                <div className='col-sm-12 d-flex'>
                    <input id={"input-"+ IDCombo} onKeyDown={(e) => SearchCombo(IDCombo, e)} className='ISearch' type="text" autoComplete="off"/>
                    <div onClick={() => ShowHideData(IDCombo)} className='CIconCombo'>
                        <i className="fa-solid fa-angle-down IconCombo"></i>
                    </div>
                </div>
                <div  combo-target={IDCombo} className="CDataCombo scrollAYF">
                    {
                        dataCombo.map((element) => {
                            return <div key={element[params.ID]} onClick={() => SelectOption(element)}  className={"CItemCombo " + (element.focus == true ? "isFocusItemCombo": "")}  id={"id-combo-"+element[params.ID]}>
                                <p className='txtItemCombo'>
                                    <b>{params.ShowID ? element[params.ID] + " - " : ""}</b>
                                    {element[params.Text]}
                                </p>  
                            </div>
                        })
                    }
                </div>
            </div>
        </>
    )
}

export default Combobox;
