package me.jiangyu.july.web.controller;

import me.jiangyu.july.web.dto.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by jiangyukun on 2015/7/27.
 */
@Controller
@RequestMapping("/backbone")
public class BackboneController {
    @RequestMapping(value = "user/{name}", method = RequestMethod.GET)
    @ResponseBody
    public User get(@PathVariable("name") String name) {
        System.out.println(name);
        return new User(name);
    }

    @RequestMapping(value = "user", method = RequestMethod.POST)
    @ResponseBody
    public String save(@RequestBody User user) {
        return "xx";
    }

    @RequestMapping(value = "user", method = RequestMethod.DELETE)
    @ResponseBody
    public String delete() {
        System.out.println("delete");
        return "xx";
    }
}
