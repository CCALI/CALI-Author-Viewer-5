@page navbuttons Navigation Buttons
@parent components.buttons 0

## Cali Lesson Buttons

The "Previous" and "Next" buttons are used to navigate through lessons.

---

#### Cali "Previous" Button Style

HTML
```
<button class="btn btn-primary CL-previous-btn" alt="previous">
	<img class="previous-arrow">Previous
</button>
```

<style type="text/css">
	.btn {
	    display: inline-block;
	    padding: 6px 12px;
	    font-weight: 400;
	    line-height: 1.42857143;
	    white-space: nowrap;
	    vertical-align: middle;
	    -ms-touch-action: manipulation;
	    touch-action: manipulation;
	    cursor: pointer;
	    -webkit-user-select: none;
	    -moz-user-select: none;
	    -ms-user-select: none;
	    user-select: none;
	}
	.CLButtonRules {
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	  font-size: 18px;
	  text-align: left;
	  width: 140px;
	  height: 40px;
	  margin: 10px 5px 0px 0px;
	}
	.CLButtonPreviousRules {
	  color: #003366 !important;
	  background: #f0f3f6 !important;
	}
	.CLPreviousActions {
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	  font-size: 18px;
	  text-align: left;
	  width: 140px;
	  height: 40px;
	  margin: 10px 5px 0px 0px;
	  color: #003366 !important;
	  background: #f0f3f6 !important;
	}
	.CLNextActions {
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	  font-size: 18px;
	  text-align: left;
	  width: 140px;
	  height: 40px;
	  margin: 10px 5px 0px 0px;
	  background: #004080 !important;
	  border: 2px solid #004080 !important;
	}
	.CLButtonArrowRules {
	  height: 30px;
	  width: 30px;
	  margin-top: -3px;
	}
	.CL-next-btn {
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	  font-size: 18px;
	  text-align: left;
	  width: 140px;
	  height: 40px;
	  margin: 10px 5px 0px 0px;
	  background: #003366;
	  border: 2px solid #003366;
	}
	.CL-next-btn:hover,
	.CL-next-btn:focus {
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	  font-size: 18px;
	  text-align: left;
	  width: 140px;
	  height: 40px;
	  margin: 10px 5px 0px 0px;
	  background: #004080 !important;
	  border: 2px solid #004080 !important;
	  outline: none !important;
	  box-shadow: none !important;
	}
	.CL-next-btn:active {
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	  font-size: 18px;
	  text-align: left;
	  width: 140px;
	  height: 40px;
	  margin: 10px 5px 0px 0px;
	  background: #004080 !important;
	  border: 2px solid #004080 !important;
	  outline: none !important;
	  box-shadow: none !important;
	  opacity: 0.95;
	}
	.CL-previous-btn {
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	  font-size: 18px;
	  text-align: left;
	  width: 140px;
	  height: 40px;
	  margin: 10px 5px 0px 0px;
	  color: #003366;
	  background: #ffffff;
	  border: 2px solid #003366;
	}
	.CL-previous-btn:hover,
	.CL-previous-btn:focus {
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	  font-size: 18px;
	  text-align: left;
	  width: 140px;
	  height: 40px;
	  margin: 10px 5px 0px 0px;
	  color: #003366 !important;
	  background: #f0f3f6 !important;
	  outline: none !important;
	  box-shadow: none !important;
	}
	.CL-previous-btn:active {
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	  font-size: 18px;
	  text-align: left;
	  width: 140px;
	  height: 40px;
	  margin: 10px 5px 0px 0px;
	  color: #003366 !important;
	  background: #f0f3f6 !important;
	  opacity: 0.85;
	}
	.next-arrow {
	  background: url(https://image.ibb.co/n7VyUH/arrow_next.png);
	  float: right;
	  height: 30px;
	  width: 30px;
	  margin-top: -3px;
	  margin-right: -5px;
	}
	.previous-arrow {
	  background: url(https://image.ibb.co/mVgSOc/arrow_previous.png);
	  float: left;
	  height: 30px;
	  width: 30px;
	  margin-top: -3px;
	  margin-right: 5px;
	  margin-left: -10px;
	}
</style>

<button class="btn btn-primary CL-previous-btn" alt="previous">
	<span class="previous-arrow"></span>Previous
</button><br/><br/><br/>

#### Cali "Next" Button Style

HTML
```
<button class="btn btn-primary CL-next-btn" alt="next">Next
	<img class="next-arrow">
</button>
```

<button class="btn btn-primary CL-next-btn" alt="next">Next
	<span class="next-arrow"></span>
</button>  
