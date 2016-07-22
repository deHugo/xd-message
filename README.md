# XD-Message

Simple cross domain messaging. This library is simply a wrapper for using iframes and the `window.postMessage` functionality which modern browsers already support. It removes some of the hassle around setting up the iframes and sending the proper origin for security.

## Usage

This library by itself may not be particularly useful. However, an example of how to get it to work can be seen below.

`http://domain1.org/parent.html`

```html
<!DOCTYPE html>
<html>
<head>
	<title>Parent</title>
	<script type="text/javascript" src="index.js"></script>
	<script type="text/javascript">
		window.messager = new XDMessage();

		window.messager.addListener(function(event){
			console.log("parent received message from child", event.data);
		});
		
		window.messager.sendToChild("http://domain2.com/child.html", "hello from parent");
	</script>
</head>
<body>
</body>
</html>
```

`http://domain2.com/child.html`

```html
<!DOCTYPE html>
<html>
<head>
	<title>Child</title>
	<script type="text/javascript" src="index.js"></script>
	<script type="text/javascript">
		window.messager = new XDMessage();
		window.messager.addListener(function(event){
			console.log("child received message from parent", event.data);
			
			window.messager.sendToParent("hi from "+document.location.toString());
		});
	</script>
</head>
<body>
</body>
</html>
```