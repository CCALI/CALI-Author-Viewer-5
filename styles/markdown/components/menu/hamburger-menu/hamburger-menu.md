@page hamburger-menu Hamburger Menu
@parent menus

## Cali Lesson Slider Hamburger Menu

This hamburger menu is used inside the navbar and requires jquery and bootstrap.js to work.

[jquery.js](https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js) & [bootstrap.js](https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js)

Learn more about bootstrap 3 collapsable nav style [here](https://getbootstrap.com/docs/3.3/components/#nav)

---

#### Hamburger Menu

HTML
```
<nav class="navbar navbar-default CL-navbar-main">
  <div class="container-fluid">
    <div class="navbar-header CL-navbar">
      <button type="button" 
      		  class="navbar-toggle collapsed CL-menu-button"
      		  data-toggle="collapse"
      		  data-target="#bs-example-navbar-collapse-1"
      		  aria-expanded="false">
        <span class="CL-hamburger-white"></span>
      </button>
    </div>

    <!-- Collapsable navigation styles -->

    <div class="collapse navbar-collapse"
    	 id="bs-example-navbar-collapse-1">
      <ul class="nav navbar-nav navbar-right">
        <li>
          <p class="navbar-text">
            <a href="#" 
               class="user-name-link">User Name
            </a>
          </p>
        </li>
        <li>
          <a href="#" 
          	 class="exit-icon">
            <span class="exit-btn" 
            	  alt="exit">
              <p class="navbar-text">
                <a href="#" 
                   class="exit-link">Exit & Resume Later
                </a>
              </p>
            </span>
          </a>
        </li>
      </ul>
    </div>

  </div>
</nav>
```

<style>
	.button, button {
	  background-color: #003366 !important;
	}
	.CL-navbar-main {
	  width: 80px;
	  width: 62px;
      height: 42px;
	  background: #003366 !important;
	  -webkit-border-radius: 0px;
	  -moz-border-radius: 0px;
	  -o-border-radius: 0px;
	  -ms-border-radius: 0px;
	  border-radius: 0px;
	}
	.CL-menu-button {
	  border: none;
	}
	.CL-menu-button:hover,
	.CL-menu-button:focus {
	  background: none !important;
	  opacity: 0.9 !important;
	}
	.CL-menu-button:checked,
	.CL-menu-button:active {
	  opacity: 0.75 !important;
	}
	.CL-hamburger-white {
	  float: right;	
	  display: block;
	  width: 32px;
	  height: 32px;
	  background: url(https://image.ibb.co/jPdfwx/hamburger_white_32px.png) center center no-repeat;
	}
</style>

<div class="CL-navbar-main">
	<button style="background-color: #003366;" type="button" class="navbar-toggle collapsed CL-menu-button" data-toggle="collapse" data-target="#" aria-expanded="false">
	<span class="CL-hamburger-white"></span>
	</button>
</div><br/>

(Run cali-simple-site to see how it works.)

