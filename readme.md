# MISSION READY - Thiago Tavares

## Mission Two - César Reynaux Website

That's my Mission Two project for Mission Ready, where I rebuilt a friend's website.

### About the Website

The purpose of this website is to showcase my JavaScript learnings.

### About Reynaux

He's a videographer from Recife and has done some sleek jobs over the past few years.

# Project Overview

## Key Concepts

### Intersection Observer API

A lot of the events on this project are triggered on scroll. However, scroll events are very heavy to run on websites because of the amount of time thei're fired. the Intersection Observer API can remedy that by watching when a target element is intersecting with the user screen and from there the event is triggered.

### DOM Traversing

DOM Traversing is how you walk through DOM elements. On this particular project it's very handy because some elements are rendered according to a database. DOM Traversing allows me to access and add events to them by selecting the parent element.

## Key Features

### Render Cards

The cards of Work and Store sections are rendered with the help of a database and some HTML pattern.

### Image Comparison

The LUT's image comparison feature on the Store section, it's a combination of CSS and Javascript where I get a radio input value on click and apply it to set the distance and width of elements on the card.

### Cart and Promo Discount

That's a validation and calculation to give discounts for the items on the cart.

### Lazy Load

Because the Work section can grow quite big depending on the database. The lazy load helps to mitigate hundreds of heavy images being loaded at the same time. Instead I have low quality versions of all images getting loaded in the page load and as the user scrolls down the images will get updated to the full size ones.

## Important Notes:

The videos displayed on the work section are Youtube iframes.
For data protection and privacy reasons, Youtube does not deal well with it's contents being linked to iframes on local enviroments.

If you're running this project on your local host.
please use :

localhost:PORT/ ---- instead of ---- IP ADDRESS:PORT/

The link you're acessing your local host should look like that :
http://localhost:3000

and NOT that :
http://127.0.0.1:5500/
