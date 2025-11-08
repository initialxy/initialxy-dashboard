This web app is a simple always-on dashboard that uses Python with Tornado as server and Vue 3 as frontend.
It strives for type safety by using Python type hints on server side and TypeScript on client side.
Data models are transported between client and serve by using Apache Thrift.
It uses a web app to render its interface. The dashboard is meant to be displayed on an e-paper / e-ink display. So it needs to be greyscale. However it can be toggled to edit mode that allows users to edit what's on the dashboard on their phone.
The dashboard has three sections: date and time, stocks and todo list.

The dashboard is already completed and functional. The current primary goal of this project is to migrate to a modern Vue version while preserving its existing features and behaviors.
