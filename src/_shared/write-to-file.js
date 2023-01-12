import fs from "fs"

export const writeToFile = (fileName, content) => {
    console.log("Harvester: writing to file ", fileName)

    const currentPath = process.cwd();
    const directoryPath = `${currentPath}/output`
    const filePath = `${directoryPath}/${fileName}`

    fs.readFile(filePath, (error, data) => {
        if (error) {
            console.log(`Error reading file ${filePath}`);
        }

        // console.log("Harvester: writing content ", content)

        if (!data) {
            fs.mkdir(directoryPath, (error) => {
                if (error) {
                    console.log("Error creating directory:", directoryPath)
                    console.log(error)
                }
            })

            fs.writeFile(filePath, JSON.stringify([]), (error) => {
                if (error)
                    console.log(error);
                else {
                    console.log("File written successfully\n");
                }
            });
        } else {
            const jsonArray = JSON.parse(data)
            jsonArray.push(content)

            fs.writeFile(filePath, JSON.stringify(jsonArray), (error) => {
                if (error)
                    console.log(error);
                else {
                    console.log("File written successfully\n");
                }
            });

        }
    })
}