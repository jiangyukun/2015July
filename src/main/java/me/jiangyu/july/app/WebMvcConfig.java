package me.jiangyu.july.app;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ViewResolverRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

import java.util.Collections;
import java.util.List;

/**
 * by jiangyukun on 2015/07/27.
 */
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = {"me.jiangyu.july.web"})
public class WebMvcConfig extends WebMvcConfigurerAdapter {
    public void configureViewResolvers(ViewResolverRegistry registry) {
        InternalResourceViewResolver viewResolver = new InternalResourceViewResolver();
        viewResolver.setPrefix("/WEB-INF/view/");
        viewResolver.setSuffix(".jsp");
        registry.viewResolver(viewResolver);
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        ByteArrayHttpMessageConverter byteType = new ByteArrayHttpMessageConverter();
        byteType.setSupportedMediaTypes(Collections.singletonList(MediaType.APPLICATION_OCTET_STREAM));
        converters.add(byteType);

        MappingJackson2HttpMessageConverter jsonType = new MappingJackson2HttpMessageConverter();
        jsonType.setSupportedMediaTypes(Collections.singletonList(MediaType.APPLICATION_JSON));
        converters.add(jsonType);

        StringHttpMessageConverter stringType = new StringHttpMessageConverter();
        MimeType mimeType = MimeTypeUtils.parseMimeType("text/plain;charset=UTF-8");
        stringType.setSupportedMediaTypes(Collections.singletonList(new MediaType(mimeType.getType(), mimeType.getSubtype(), mimeType.getCharSet())));
        converters.add(stringType);
    }

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        configurer.enable();
    }
}
