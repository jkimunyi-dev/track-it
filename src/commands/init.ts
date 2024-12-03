import * as fs from "fs-extra";
import * as path from "path";

export function initRepository(): void{
	// Using .track-it instead of .git 
	const repoPath = path.resolve(process.cwd(), ".track-it");

	try{
		// Create repository directories
		fs.mkdirSync(repoPath, {recursive : true});
		fs.mkdirSync(path.join(repoPath, "objects"), {recursive : true});
		fs.mkdirSync(path.join(repoPath, "refs"), {recursive : true});

		// Create the HEAD file
		fs.writeFileSync(path.join(repoPath, "HEAD"), "refs: refs/heads/main");

		// Create a .track-itignore file instead of gitignore with some default entries

		const defaultIgnoreContent = `
			# Default Track-It ignore file
			node_modules/
			.DS_Store
			*.log
			dist/`;
		
		fs.writeFileSync(path.resolve(process.cwd(), ".track-iignore"), defaultIgnoreContent);

		console.log("Track-It repository initiated succesfully");
		console.log("Create .track-it directory and .track-itignore file")

	}catch(error){
		console.log("Failed to initialize Track-It repository:", error);
		process.exit(1)
	}
}