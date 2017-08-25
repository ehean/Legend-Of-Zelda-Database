var MAIN_URL = 'http://flip3.engr.oregonstate.edu:13983/'

function deleteRow(event) {
	var req = new XMLHttpRequest()
	var tableName = event.target.parentNode.parentNode.parentNode.id
	console.log(tableName)
	tableName = tableName.slice(0, -4)
    var payload = {event: 'delete', table: tableName, id:event.target.value}

    req.open('POST', MAIN_URL, true)
    req.setRequestHeader('Content-Type', 'application/json')
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {

			var data = JSON.parse(req.responseText)

			if (data.event === "delete" && data.table === tableName && data.id === event.target.value) {

				var row = event.target.parentNode.parentNode
				console.log(row)
				row.parentNode.removeChild(row)
			}
    	}
		else {
			console.log("Error in network request: " + req.statusText)
		}
    });
	req.send(JSON.stringify(payload))
	event.preventDefault()
}


function search(event)
{
	var req = new XMLHttpRequest()
	var term = document.getElementById("searchField").value
	var payload = {event: 'search', searchTerm: term}

    req.open('POST', MAIN_URL, true)
    req.setRequestHeader('Content-Type', 'application/json')
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {
			console.log(req.responseText)
			var data = JSON.parse(req.responseText)
			//data = data[0]
			console.log(data)

			var resultsDiv = document.getElementById("searchResults")

			// remove old table
			while (resultsDiv.firstChild) {
				resultsDiv.removeChild(resultsDiv.firstChild)
			}

			var h3 = document.createElement("h3")
			h3.innerHTML = "Results for '".concat(term, "':")
			resultsDiv.appendChild(h3)
			var table = document.createElement("table")
			table.setAttribute("class", "pure-table pure-table-striped")
			resultsDiv.appendChild(table)
			var thead = document.createElement("thead")
			table.appendChild(thead)
			var headerRow = document.createElement("tr")
			thead.appendChild(headerRow)
			var tableHeader = document.createElement("td")
			tableHeader.innerHTML = "Table"
			thead.appendChild(tableHeader)
			var nameHeader = document.createElement("td")
			nameHeader.innerHTML = "Title/Name"
			thead.appendChild(nameHeader)
			var tbody = document.createElement("tbody")
			table.appendChild(tbody)

			
			for (i = 0; i < data.length; i++) {
				for (j = 0; j < data[i][1].length; j++) {
					var row = document.createElement("tr")
					tbody.appendChild(row)
					var tableCell = document.createElement("td")
					var nameCell = document.createElement("td")
					
					console.log(data[0])
					row.appendChild(tableCell)
					row.appendChild(nameCell)
					tableCell.innerHTML = data[i][0]
					tableCell.setAttribute("value", data[i][0])
					if (Object.keys(data[i][1][j]) == "title") {
						nameCell.innerHTML = data[i][1][j].title
						nameCell.setAttribute("value", data[i][1][j].title)
						console.log(data[i][1][j].title)
					}
					else {
						nameCell.innerHTML = data[i][1][j].name
						nameCell.setAttribute("value", data[i][1][j].name)
						console.log(data[i][1][j].name)
					}
				}
			}
    	}
		else {
			console.log("Error in network request: " + req.statusText)
		}
    });
	req.send(JSON.stringify(payload))
	event.preventDefault()
}

function showRelationships(event) 
{
	var req = new XMLHttpRequest()
	var entity = event.target.parentNode.id
	var entityID = event.target.parentNode.firstElementChild.value
	console.log(entityID)
	entity = entity.substring(0, entity.length - 8)
	console.log(entity)
	var payload = {event: 'relationship', entityName: entity, id: entityID}

    req.open('POST', MAIN_URL, true)
    req.setRequestHeader('Content-Type', 'application/json')
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {
			console.log(req.responseText)
			var data = JSON.parse(req.responseText)
			console.log(data)

			var resultsDiv = document.getElementById("relationshipResults")

			// remove old tables
			while (resultsDiv.firstChild) {
				resultsDiv.removeChild(resultsDiv.firstChild)
			}

			var subDiv = document.createElement("div")
			subDiv.setAttribute("id", entity + "-" + entityID)
			resultsDiv.appendChild(subDiv)

			// For every entity, create a table
			for (var i = 0; i < data.length; ++i) {
				for (entityValue in data[i]) {
					var h3 = document.createElement("h3")
					h3.innerHTML = entityValue
					subDiv.appendChild(h3)
					var table = document.createElement("table")
					table.setAttribute("class", "pure-table pure-table-striped")
					subDiv.appendChild(table)
					var thead = document.createElement("thead")
					table.appendChild(thead)
					var headerRow = document.createElement("tr")
					thead.appendChild(headerRow)
				
					// create headers
					for (attribute in data[i][entityValue][0]) {
						var tableHeader = document.createElement("td")
						tableHeader.innerHTML = attribute
						thead.appendChild(tableHeader)
					}

					var tbody = document.createElement("tbody")
					table.appendChild(tbody)

					var rows = []
					var fields = [[]]
					// create rows and cells
					for (var j = 0; j < data[i][entityValue].length; j++) {
						// create row
						var newRow = document.createElement("tr")
						rows.push(newRow)
						tbody.appendChild(rows[j])
						fields.push([])
						var cell = 0
						for (attribute in data[i][entityValue][j]) {
							// create cell
							console.log(data[i][entityValue][j][attribute])
							var newField = rows[j].insertCell(cell)
							newField.setAttribute("value", data[i][entityValue][j][attribute])
							newField.innerHTML = data[i][entityValue][j][attribute]
							fields[j].push(newField)
							cell++
						}
						// add remove button at end of row
						if ((entity == 'Games' && entityValue == 'Characters') || (entity == 'Consoles' && entityValue == 'Games')) {
							var newField = rows[j].insertCell(cell)
							var newButton = document.createElement("button")
							newField.appendChild(newButton)
							newButton.innerHTML = "Remove"
							newButton.setAttribute("onclick", "removeRelationship(event)")
							newButton.setAttribute("class", "pure-button")
							cell++
						}
					}
				}
			}
    	}
		else {
			console.log("Error in network request: " + req.statusText)
		}
    });
	req.send(JSON.stringify(payload))
	event.preventDefault()
}


function addRelationship(event)
{
	var req = new XMLHttpRequest()
	var relationship = event.target.id
	relationshipName = relationship.slice(0, -4)
	entityID1 = event.target.parentNode.parentNode.childNodes[3].firstElementChild.value
	console.log(entityID1)
	entityID2 = event.target.parentNode.parentNode.childNodes[5].firstElementChild.value
	console.log(entityID2)
	var payload = {event: 'changeRelationship', relationship: relationshipName, id1: entityID1, id2: entityID2}

    req.open('POST', MAIN_URL, true)
    req.setRequestHeader('Content-Type', 'application/json')
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {
			console.log(req.responseText)
			var data = JSON.parse(req.responseText)
			console.log(data)

			var resultsDiv = document.getElementById(relationshipName + "_Result")
			if (data.affectedRows == 1) {
				resultsDiv.innerHTML = "You have successfully added the relationship!"
			}
			else if (data.code == "ER_DUP_ENTRY") {
				resultsDiv.innerHTML = "Relationship already exists."
			}
			else {
				resultsDiv.innerHTML = "Sorry, something went wrong. Relationship was not added."
			}
			
    	}
		else {
			console.log("Error in network request: " + req.statusText)
		}
    });
	req.send(JSON.stringify(payload))
	event.preventDefault()
}

function removeRelationship(event)
{
	console.log("remove relationship")
	var req = new XMLHttpRequest()
	var divID = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id
	var table = divID.slice(0, divID.search('-'))
	var childIDVal = parseInt(event.target.parentNode.parentNode.firstElementChild.innerHTML)
	var parentIDVal = parseInt(divID.slice(divID.search('-')+1, divID.length))
	console.log(table)
	console.log(childIDVal)
	console.log(parentIDVal)
	var payload = {event: "removeRelationship", parentTable: table, childID: childIDVal, parentID: parentIDVal}

    req.open('POST', MAIN_URL, true)
    req.setRequestHeader('Content-Type', 'application/json')
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {
			var data = JSON.parse(req.responseText)
			console.log(data)
			var resultsDiv = document.createElement("p")
			var div = event.target.parentNode.parentNode.parentNode.parentNode.parentNode
			div.insertBefore(resultsDiv, div.firstChild)
			if (data.affectedRows == 1) {
				resultsDiv.innerHTML = "You have successfully removed the relationship!"
				var row = event.target.parentNode.parentNode
				console.log(row)
				row.parentNode.removeChild(row)
			}
			else {
				resultsDiv.innerHTML = "There was an error in removing the relationship."
			}
    	}
		else {
			console.log("Error in network request: " + req.statusText)
		}
    });
	req.send(JSON.stringify(payload))
	event.preventDefault()
}