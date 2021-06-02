const backendURL = `http://localhost:5000`
var userData;

const uuidv4 = () => {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}

const init = () => {
	let content = document.querySelector("#todo-content");
	fetch(`${backendURL}/api/todo/?email=${userData.email}`,{
		method:"GET",
		headers:{
			"Content-Type":"application/json"
		},
	})
	.then(response=>response.json())
	.then(res=>{
		res.forEach((item)=>{
			let placeholder = document.querySelector("#todo-placeholder")
			if(!placeholder.classList.contains("d-none")){
				placeholder.classList.add("d-none")
			}
			console.log(item)
			let addHTML =
				`<li id="todo-${item.id}" class="list-group-item d-flex justify-content-between align-items-center">
					${item.value}
					<button type="button" class="btn btn-danger btn-sm ml-3" onclick="deleteTodo('${item.id}')">Delete</button>
				</li>`
			content.innerHTML+=addHTML;
		})
	})
}

const deleteTodo = (id) => {
	let element = document.querySelector(`#todo-${id}`);
	let content = document.querySelector("#todo-content");
	let placeholder = document.querySelector("#todo-placeholder")
	element.remove();
	console.log(content.innerHTML)
	if(content.childNodes.length === 3){
		placeholder.classList.remove("d-none")
	}
	// remove from db with fetch
	fetch(`${backendURL}/api/todo/delete`,{
		method:"DELETE",
		headers:{
			"Content-Type":"application/json"
		},
		body: JSON.stringify({
			email: userData.email,
			id: id
		})
	})
	.then(response=>response.json())
	.then(res=>{
		console.log(res)
	})
}

const addTodo = ()=>{
	let placeholder = document.querySelector("#todo-placeholder")
	if(!placeholder.classList.contains("d-none")){
		placeholder.classList.add("d-none")
	}
	let text = document.querySelector("#todo-text");
	let content = document.querySelector("#todo-content");
	let identifier = uuidv4().replace(/-/g,"")
	if(text.value.trim()){
		const addHTML =
		`<li id="todo-${identifier}" class="list-group-item d-flex justify-content-between align-items-center">
			${text.value}
			<button type="button" class="btn btn-danger btn-sm ml-3" onclick="deleteTodo('${identifier}')">Delete</button>
		</li>`
		content.innerHTML+=addHTML;
		const value = text.value
		text.value = "";
		// add to db with fetch
		fetch(`${backendURL}/api/todo/add`,{
			method:"POST",
			headers:{
				"Content-Type":"application/json"
			},
			body: JSON.stringify({
				email: userData.email,
				items:{
					id: identifier,
					value: value
				}
			})
		})
		.then(response=>response.json())
		.then(res=>{
			console.log(res)
		})
	}
}

const toggleView = (intoView) => {
	const dashboard = document.querySelector("#dashboard-view");
	const login = document.querySelector("#login-view");
	const loader = document.querySelector("#loading-view");
	switch(intoView){
		case "login":
			loader.classList.add("d-none");
			login.classList.remove("d-none");
			break;
		case "dashboard":
			loader.classList.add("d-none");
			dashboard.classList.remove("d-none");
			const name = document.querySelector("#name");
			name.innerText = userData.name;
			break;
		default:
			break;
	}
}

const toggleLoading = (method) => {
	const btnPrimary = document.querySelector("#btn-primary");
	const btnLoading = document.querySelector("#btn-loading");
	switch (method) {
		case "start":
			btnPrimary.classList.add("d-none");
			btnLoading.classList.remove("d-none");
			break;
		case "stop":
			btnPrimary.classList.remove("d-none");
			btnLoading.classList.add("d-none");
			break;
		default:
			break;
	}
}

const createTokenSetResp = (data, items) => {
	localStorage.setItem("user",btoa(JSON.stringify({
		name: data.name,
		email: data.email,
		items: items
	})));
}

const fetchTokenSetResp = () => {
	let content = localStorage.getItem("user")
	if(content!==null){
		return JSON.parse(atob(content));
	}
	else{
		return null
	}
}

const app = () => {
	userData = fetchTokenSetResp();
	if(userData){
		toggleView("dashboard");
		init();
	}
	else{
		toggleView("login")
	}
	const socket = io(backendURL);
	const loginBtn = document.querySelector("#github-btn");
	const logoutBtn = document.querySelector("#logout");
	const addBtn = document.querySelector("#todo-add");
	let authWindow;
	loginBtn.addEventListener("click",()=>{
		toggleLoading("start")
		authWindow = window.open(`https://github.com/login/oauth/authorize?client_id=194ec52f484b36d8451e`,'_blank',"toolbar=0,location=0,menubar=0")
	})
	logoutBtn.addEventListener("click",()=>{
		localStorage.removeItem("user");
		location.reload();
	})
	addBtn.addEventListener("click",()=>{
		addTodo();
	})
	socket.on("auth",(res)=>{
		let items=[]
		createTokenSetResp(res,items);
		toggleLoading("stop")
		authWindow.close();
		location.reload()
	})
}

window.onload = () => {
	app()
}