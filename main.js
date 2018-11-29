//require
const fs = require("uxp").storage.localFileSystem;
const { error } = require("./lib/dialogs.js");

//functions
async function readTextFromFile(selection) 
{
    //read quotations file
    const pluginFolder = await fs.getPluginFolder();
    const inputFile = await pluginFolder.getEntry("quotes.json");
    if (!inputFile)
        return;
    const contents = JSON.parse(await inputFile.read());

    //read all key words into a list
    const keyNames = Object.keys(contents);
    
    //for each key word read corresponding quotes into a dictionary
    var values = {};
    var keyName;
    var value;
    for (let index = 0; index < keyNames.length; index++) 
    {
        keyName = keyNames[index];
        value = contents[keyNames[index]];
        values[keyName] = value;
    }
    
    //ensure user enters something
    if (selection.items.length <= 0) 
    {
        return error("Error","Must enter some value!")
    }
    
    //create ui ingredients
    const labelWrapper = document.createElement("labelWrapper");
    labelWrapper.className = "found";
    const select = document.createElement("select");
    const dialog = document.createElement("dialog");

    //read each word of the text entered using regex
    var sentence = selection.items[0].text;
    var words = sentence.match(/\w+/g);
    var found;
    for (let index = 0; index < sentence.length; index++)
    {
        if (keyNames.includes(words[index]))
        {
            found = words[index];
            console.log("Found it -->", found);
            console.log("You can choose from the following options: ");    
            console.log(values[found]);

            //create drop down values for each quotation and group them based on common label and wrap to Blackboard
            values[found].forEach(x => {
                                            const el = document.createElement("option");
                                            el.setAttribute("key", found);
                                            el.textContent = x;
                                            el.value = x;
                                            select.appendChild(el);
                                       }
                                 )
            const label = document.createElement("label");
            label.setAttribute("group", found);
            label.textContent = found;
            labelWrapper.appendChild(label);
            labelWrapper.appendChild(select);
            select.value = values[found][0];
        }
    }
    
    dialog.innerHTML = `
    <style>
       form {
        background-image: linear-gradient(to bottom right, grey, blue);   
        background-color: #F7F7F7;   
       }
    
       p.b {
        font: bold;
        font-size: 20px;
        font-weight: bold;
        font-family: Calibri;
        text-align: center;
        vertical-align:middle;
        padding: 0px;
        margin: 12px
       }

       .found {
        font-family: Calibri;
        text-align: center;
        font-size: 25px;
       }
    </style>
    <form width=320>
    <p class="b">Pick Something</p>
      <hr />
      <div id="wrapper"></div>
      <footer>
         <button uxp-variant="cta", id="ok"> Quote it</button>
      </footer>
    </form>
    `;

    dialog.querySelector("#wrapper").appendChild(labelWrapper);
    const form = dialog.querySelector("form");
    form.onsubmit = () => {
        dialog.close("ok");
    }
    const okButton = dialog.querySelector("#ok");
    okButton.onclick = evt => {
        evt.preventDefault();
        dialog.close("ok");
    }

    document.appendChild(dialog);
    const result = await dialog.showModal();
    if (result === "ok") {
        const selects = Array.from(document.querySelectorAll("select"));
        console.log(selects[0].value);
        const textNode = selection.items[0];
        textNode.text = textNode.text.replace(found,selects[0].value);
    }
}

//export
module.exports.commands = {
    "readTextFromFile": readTextFromFile
};

