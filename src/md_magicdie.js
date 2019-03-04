const die = (() => {
    const dief = {
        cvt: function (diceRoll) {
            let diceObj = {};
            if(diceRoll[0] == "-"){
                diceRoll = diceRoll.replace("-", "");
                diceObj.negative = true;
            }
            if (diceRoll.includes("+")) {
                diceObj.foreach_modifier = parseInt(diceRoll.split("+")[1]);
            }
            diceRoll = diceRoll.split("d");
            diceObj.iterator = (diceRoll[0] != "") ? parseInt(diceRoll[0]) : 1;
            diceObj.face = parseInt(diceRoll[1]);
            return diceObj;
        },
        r: function (arg, mute) {
            const rCvrt = this.cvt(arg);
            if (rCvrt.iterator == 0) {
                return 0;
            }
            let total = 0;
            if (rCvrt.foreach_modifier) {
                if (!mute) {
                    console.log("Modfier (+" + rCvrt.foreach_modifier + ")");
                }
            }
            let roll;
            for (let i = 1; i <= rCvrt.iterator; i++) {
                roll = Math.floor(Math.random() * rCvrt.face) + 1;
                if (rCvrt.foreach_modifier)
                    roll += rCvrt.foreach_modifier;
                if (!mute)
                    console.log("Roll " + i + ": " + roll);
                total += roll;
            }
            if(rCvrt.negative)
                total = total * -1;
            if (!mute) {
                console.log("Total roll: " + total);
            }
            return total;
        },
        s: function (diceObj) {
            let roll = `${diceObj.iterator}d${diceObj.face}`;
            if (diceObj.foreach_modifier) {
                roll += `+${diceObj.foreach_modifier}`
            }
            return roll;
        },
        gfx_dice: function (arg, x, y) {
            const rollObj = this.cvt(arg);
            const dice = new richDice(x, y);
            dice.setTitle(`Dice Roll (${arg})`);
            dice.setDescription(`You raise your hand and throw the dice across the table.`);
            dice.setSize(250, 750);
            dice.css.alignment = "left";
            let roll;
            let total = 0;
            if (rollObj.iterator > 1) {
                for (let i = 1; i <= rollObj.iterator; i++) {
                    roll = Math.floor(Math.random() * rollObj.face) + 1;
                    if (rollObj.foreach_modifier) {
                        roll += rollObj.foreach_modifier;
                    }
                    dice.addField(`Roll ${i}: `, roll);
                    total += roll;
                }
            } else {
                total = Math.floor(Math.random() * rollObj.face) + 1;
                if (rollObj.negative)
                    total = total * -1
            }
            if (rollObj.iterator == 0) {
                total = 0;
            }
            dice.addField(`Total: `, total);
            dice.render();
            return dice;
        }
    }
    return dief
})();

const richDice = (() => {
    class richDice {
        constructor(x = 0, y = 0) {
            this.x = x,
                this.y = y,
                this.css = {
                    size: "",
                    alignment: "center",
                    footer_padding: 20,
                    background: "",
                },
                this.title = "Untitled Window",
                this.fields = new Map(),
                this.image = "",
                this.ID = Math.floor(Math.random() * 100000);
        }
        setTitle(title) {
            this.title = title;
        }
        setSize(width, height) {
            if (width) {
                this.css.size += `max-width: ${width}px;`;
                this.width = width;
            }
            if (height) {
                this.height = height;
                this.css.size += `max-height: ${height}px;`
            }
        }
        setBackground(url) {
            this.css.background = `background: url('${url}') center center;`;
        }
        setDescription(desc) {
            this.desc = desc;
        }
        setImage(url) {
            this.image = `<img src="${url}" alt="Image">`;
        }
        addField(title, text) {
            this.fields.set(title, {
                type: 0,
                content: text
            });
        }
        addPrompt(title, placeholder) {
            this.fields.set(title, {
                type: 1,
                content: placeholder
            });
        }
        addCustomHTML(title, text) {
            this.fields.set(title, {
                type: 2,
                content: text
            });
        }
        get dom() {
            return document.getElementsByClassName(this.ID)[0];
        }
        render(callback) {
            this.clicks = "";
            if (this.dom) {
                this.dom.remove();
            }
            /* The richDice Content */
            let content = `<h3>${this.title}</h3>`;
            if (this.desc) {
                content += `<p>${this.desc}</p>`;
            }
            content += this.image;
            this.fields.forEach((v, k) => {
                if (v.type == 0) {
                    content += `
                    <h4>${k}</h4>
                    <span>${v.content}</span>`;
                } else if (v.type == 1) {
                    content += `
                    <label for="${this.ID+k}">${k}</label>
                    <input type="text" placeholder="${v.content}" class="${this.ID+k}">`;
                } else if (v.type == 2) {
                    content += `
                        <h4>${k}</h4>
                        ${v.content}`;
                }
            });

            /* The richDice Container */
            const container = `<div class="richDice ${this.ID}" style="left: ${this.x}; top: ${this.y}; ${this.css.background}">
            <div class="richBar"><span class="richClose"></span></div>
            <div class="richContent" style="text-align: ${this.css.alignment}; padding-bottom: ${this.css.footer_padding}px; ${this.css.size}">
                ${content}
            </div>
            </div>`;
            document.getElementById("main").insertAdjacentHTML('beforeend', container);
            this.dom.firstElementChild.getElementsByClassName("richClose")[0].addEventListener("click", () => {
                this.dom.remove();
            });

            /* you know javascript is the best language when this ugly mess is the only way of getting this to work. kill me.*/
            var obj = this;

            function mouseMove(e) {
                if (!obj.clicks) {
                    obj.clicks = {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
                // if box is removed but mousemove event is still ongoing
                if (!obj.dom) {
                    this.clicks = "";
                    window.removeEventListener("mousemove", mouseMove);
                    return false;
                }
                obj.dom.style.left = obj.x += (e.clientX - obj.clicks.x);
                obj.dom.style.top = obj.y += (e.clientY - obj.clicks.y);

                obj.clicks.x = e.clientX;
                obj.clicks.y = e.clientY;
            }
            this.dom.firstElementChild.addEventListener("mousedown", () => {
                this.dom.style.userSelect = "none";
                window.addEventListener("mousemove", mouseMove);
            });
            this.dom.addEventListener("mouseup", () => {
                this.dom.style.userSelect = "";
                this.clicks = "";
                window.removeEventListener("mousemove", mouseMove);
            });
            if (callback) callback(this.dom);
        }
        genPrompt(title, desc, prompt = {}, callback){
            const {
                p_title = p_title,
                p_placeholder = p_placeholder
            } = prompt;
            this.setTitle(title);
            this.setDescription(desc);
            this.setSize("300");
            this.css.alignment = "left";
            this.addPrompt(prompt.p_title, prompt.p_placeholder);
            this.render((dom)=>{
                dom.addEventListener("keypress", (e)=>{
                    if(e.key == "Enter"){
                        const data = document.getElementsByClassName(this.ID+prompt.p_title)[0].value;
                        callback(data);
                        this.dom.remove();
                    }
                });
            });
        }
    }
    return richDice;
})();


const Spell = (() => {
    function getGetOrdinal(n) {
        var s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return (n != 0) ? n + (s[(v - 20) % 10] || s[v] || s[0]) : "Cantrip";
    }
    class Spell {
        constructor(props = {}) {
            const {
                name = "Unkown Spell",
                    level = "1st",
                    school = "Spell",
                    components = "V S",
                    ctime = "1 Action",
                    ritual = "no",
                    concentration = "no",
                    description = "No description exists for this spell.",
                    duration = "Instantaneous",
                    range = "10 feet",
                    roll = "0d4",
                    url = "https://dnd5e.fandom.com/wiki/"+name.replace(/ /g, "_"),
            } = props;
            this.name = name;
            if(!isNaN(level)){
                this.level = getGetOrdinal(level);
            }else{
                this.level = level;
            }
            this.ctime = ctime;
            this.ritual = ritual;
            this.concentration = concentration;
            this.school = school;
            this.description = description;
            this.components = (typeof (components) != "string") ? components.join(" ") : components;
            if(!isNaN(duration)){
                this.duration = (duration !== 0) ? duration + " minutes" : "Instantaneous";
            }else{
                this.duration = duration;
            }
            if(!isNaN(range)){
                this.range = range+" feet";
            }else{
                this.range = range;
            }
            this.roll = roll;
            this.url = url;
        }
        cast(lvl) {
            let attck = this.roll;
            if (lvl > this.level) {
                attck = die.cvt(attck);
                attck.iterator += (lvl - this.level); // add x dice per level
                attck = attck.iterator + "d" + attck.face + ((attck.modifier) ? "+" + attck.modifier : ""); // convert back to xdx+m format
            }
            console.log("Rolling (" + attck + ")");
            return die.r(attck);
        };
        get intLvl(){
            return (isNaN(Number(this.level[0]))) ? 0 : Number(this.level[0]);
        }
        get wiki() {
            window.open(this.url);
        };
        get x() {
            console.log("\n" + this.name.toUpperCase());
            console.log(this.level + "-level " + this.school);
            console.log("Casting Time: " + this.ctime);
            console.log("Range: " + this.range);
            console.log("Components: " + this.components);
            console.log("Duration: " + this.duration);
            console.log(`Roll: ${this.roll}`);
            console.log(`${this.description}`);
        }
    };
    return Spell;
})();

class Item {
    constructor(props = {}) {
        const {
            name = "Unkown Item",
                cost = 0,
                dmg = "",
                dmgType = "",
                range = 10,
                desc = "No description exists for this item",
                weight = 1,
                qnty = 1,
                properties = [],
                singleUse = false
        } = props;
        this.name = name;
        this.cost = cost;
        this.dmgType = dmgType;
        this.desc = desc;
        this.range = range;
        this.dmg = dmg;
        this.weight = weight;
        this.properties = properties;
        this.singleUse = singleUse;
        this.qnty = qnty;
    }
    get tWeight() {
        return this.weight * this.qnty;
    }
}

// start up banner
console.log("%cMagic Dice", "font-size: 30px; color: #c51b1b; text-shadow: 1px 1px black; font-family: Georgia, serif;");
console.log("%cA character manager built for Dungeons & Dragons 5e", "font-size: 14px; font-style: italic; font-weight: bold; font-family: 'Trebuchet MS', Helvetica, sans-serif;padding: 5px;");

// first time message for people new to the app.
window.addEventListener("load", () => {
    if (!localStorage.getItem("md_firstrun")) {
        const window = new richDice((document.body.clientWidth / 2) - 260, 150);
        window.setTitle("Welcome to Magic Dice!");
        window.setSize(520, 700);
        window.addField("Where is everything?", `So, you might have noticed there seems to be a lack of anything on the screen besides this box... and that's by design! Let me explain; This program was and still is designed around the JavaScript REPL present in most modern web browsers (I recommend Chrome or Chromium for Magic Dice). To perform more advanced functions, you may need to be familiar with said console.`)
        window.addField("How do I get started?", `To begin, first open your Dev Console; F12 on Google Chrome. Then the world is yours! (Hint: type ply to access the currently loaded players!)`);
        window.addCustomHTML("Some Sample Commands", `<ul><li><strong>Load.restoreFromFile():</strong> You can restore a character from a save file (.json), There's some sample characters located in MagicDice itself, in the examples directory!</li><li><strong>die.r("d20"):</strong> This command rolls a d20! Substitute d20 for any dice combination like 6d8.</li><li><strong>Player Generation:</strong> A series of commands to create a default PC!<ol><li>let John = new Player({lvl: 3})</li><li>John.name = "John Smith"</li><li><i>Edit the object to your hearts content.</i> (Not a command)</li><li>John.enableShortcuts()</li><li><i>Click outside of the console and press shift X on your keyboard and watch.</i> (Not a command)</li></ol></li></ul>`);
        window.render();

        localStorage.setItem("md_firstrun", "true");
    }
});