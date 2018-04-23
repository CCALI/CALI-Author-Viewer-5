@page slider-menu Slider Menu
@parent menus

## Cali Lesson Slider Hamburger Menu

This slider menu is used for the hamburger menu on the table of contents.

---

#### Slider Hamburger Menu

HTML
```
<input class="CL-hamburger" 
	   type="checkbox" 
	   id="toc-menu" 
	   placeholder="Table of Contents Menu">
</input>
```

<style>
	input.CL-hamburger[type="checkbox"] {
	  content: url(https://image.ibb.co/gVyoEH/hamburger_menu_32px.png);
	  display: block;
	  width: 32px;
	  height: 32px;
	  cursor: pointer;
	  -webkit-appearance: none;
	  -moz-appearance: none;
	  -o-appearance: none;
	  -ms-appearance: none;
	  appearance: none;
	  outline: none;
	}
	input.CL-hamburger[type="checkbox"]:checked {
	  content: url(https://image.ibb.co/mVgSOc/arrow_previous.png);
	  -webkit-appearance: none;
	  -moz-appearance: none;
	  -o-appearance: none;
	  -ms-appearance: none;
	  appearance: none;
	  outline: none;
	}	
</style>

<input class="CL-hamburger" type="checkbox"></input>