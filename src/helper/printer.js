export let printer = (debug, context, element, value) => {
    if (debug == true) {
        console.log(`${context} - ${element} >> ${value}`);
    };
};