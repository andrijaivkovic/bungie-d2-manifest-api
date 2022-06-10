# Bungie's Destiny 2 Manifest File API

This project is a quasi-Restful API that is used in development of it's sister project<br>
also developed by me: https://github.com/andrijaivkovic/bungie-d2-api-app

This API is developet using **NodeJS** and **Express** framework.

This API is mainly used to speed up the aquisition of various Definitions used <br> in Bungie's API.
Aquisition of these Definitions is also possible using Bungie's API<br> but it's much slower that this
local solution.

Manifest file is an SQL database that contains data in JSON format about various things<br> in Bungie's video game: Destiny 2.
Definitions are used to get data in JSON format<br> based on it's ID (things like in-game items).

This API only has one API endpoint and that is all it basically needs.<br> This endpoint is located on
**/Platform/Destiny2/Manifest/{entityType}/{hashIdentifier}**.<br> _"entityType"_ is a type of Definition
(eg. DestinyInventoryItemDefinition) that the item is<br> located in and _"hashIdentifier"_ is the item's ID.
