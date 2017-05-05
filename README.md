## a-painter-loader

Component that let you import [A-Painter](https://aframe.io/a-painter) drawings in any of your [A-Frame](https://aframe.io/) scenes.

[SEE THE DEMO](http://swimminglessonsformodernlife.com/a-painter-loader-component/example)

![](https://d3vv6lp55qjaqc.cloudfront.net/items/2z39372h2G0T0K2l1D1H/Image%202017-05-05%20at%204.18.21%20PM.png)

## Loading a drawing saved with a-painter

When saving a drawing on [A-Painter](aframe.io/a-painter) you will get an URL that stores the drawing data.

![](https://d3vv6lp55qjaqc.cloudfront.net/items/2U0O0T0B2q311P0N0H3o/Image%202017-05-05%20at%204.28.13%20PM.png)

You can load the drawing by passing the URL to the `a-painter-loader` component. You can position, rotate or scale the drawing like any other entity.

```html
<a-entity a-painter-loader="src: https://ucarecdn.com/bacf6186-96b1-404c-9751-e955ece04919/"></a-entity>
```

